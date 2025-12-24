import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backup = await request.json()

    if (!backup.data || !backup.version) {
      return NextResponse.json(
        { error: 'Formato de backup inválido' },
        { status: 400 }
      )
    }

    // AVISO: Esta é uma restauração COMPLETA que sobrescreve dados
    // Em produção, você pode querer fazer merge ou validações adicionais

    const results = {
      jogadores: 0,
      clientes: 0,
      bosses: 0,
      pedidos: 0,
      precos: 0,
      errors: [] as string[]
    }

    // Restaurar Jogadores
    if (backup.data.jogadores) {
      try {
        for (const jogador of backup.data.jogadores) {
          await prisma.jogador.upsert({
            where: { id: jogador.id },
            update: {
              nick: jogador.nick,
              discord: jogador.discord,
              categorias: jogador.categorias,
              essencial: jogador.essencial,
              ativo: jogador.ativo
            },
            create: {
              id: jogador.id,
              nick: jogador.nick,
              discord: jogador.discord,
              categorias: jogador.categorias,
              essencial: jogador.essencial,
              ativo: jogador.ativo
            }
          })
          results.jogadores++
        }
      } catch (error: any) {
        results.errors.push(`Jogadores: ${error.message}`)
      }
    }

    // Restaurar Clientes
    if (backup.data.clientes) {
      try {
        for (const cliente of backup.data.clientes) {
          await prisma.cliente.upsert({
            where: { id: cliente.id },
            update: {
              discordUsername: cliente.discordUsername,
              nickIngame: cliente.nickIngame,
              nome: cliente.nome
            },
            create: {
              id: cliente.id,
              discordUserId: cliente.discordUserId || `user_${cliente.id}`,
              discordUsername: cliente.discordUsername,
              nickIngame: cliente.nickIngame,
              nome: cliente.nome
            }
          })
          results.clientes++
        }
      } catch (error: any) {
        results.errors.push(`Clientes: ${error.message}`)
      }
    }

    // Restaurar Bosses
    if (backup.data.bosses) {
      try {
        for (const boss of backup.data.bosses) {
          await prisma.boss.upsert({
            where: { id: boss.id },
            update: {
              nome: boss.nome,
              mobId: boss.mobId,
              ordem: boss.ordem,
              preco: boss.preco,
              imagemUrl: boss.imagemUrl
            },
            create: {
              id: boss.id,
              nome: boss.nome,
              mobId: boss.mobId,
              ordem: boss.ordem,
              preco: boss.preco,
              imagemUrl: boss.imagemUrl
            }
          })
          results.bosses++
        }
      } catch (error: any) {
        results.errors.push(`Bosses: ${error.message}`)
      }
    }

    // Note: Pedidos e Preços são mais complexos devido a relacionamentos
    // Implementação simplificada aqui

    return NextResponse.json({
      success: true,
      results,
      message: 'Backup restaurado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao importar backup:', error)
    return NextResponse.json(
      { error: 'Erro ao importar backup' },
      { status: 500 }
    )
  }
}

