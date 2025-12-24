import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Carrys
      {
        source: '/admin/pedidos',
        destination: '/carrys/agendamento',
        permanent: true,
      },
      {
        source: '/admin/projecao',
        destination: '/carrys/resumo',
        permanent: true,
      },
      {
        source: '/admin/calendario',
        destination: '/carrys/calendario',
        permanent: true,
      },
      {
        source: '/admin/carry-gratis',
        destination: '/carrys/carry-gratis',
        permanent: true,
      },
      // Ferramentas
      {
        source: '/admin/crm',
        destination: '/ferramentas/crm',
        permanent: true,
      },
      {
        source: '/calculadora',
        destination: '/ferramentas/tigrinho',
        permanent: true,
      },
      {
        source: '/precos',
        destination: '/ferramentas/precos',
        permanent: true,
      },
      // Calculadoras
      {
        source: '/calculadora-fisica',
        destination: '/calculadoras/fisica',
        permanent: true,
      },
      {
        source: '/dano',
        destination: '/calculadoras/magica',
        permanent: true,
      },
      {
        source: '/farm',
        destination: '/calculadoras/farm',
        permanent: true,
      },
      // Configurações
      {
        source: '/config-farm',
        destination: '/configuracoes/precos',
        permanent: true,
      },
      {
        source: '/admin/usuarios',
        destination: '/configuracoes/usuarios',
        permanent: true,
      },
      {
        source: '/admin/jogadores',
        destination: '/configuracoes/membros',
        permanent: true,
      },
      {
        source: '/admin/perfil',
        destination: '/configuracoes/perfil',
        permanent: true,
      },
      {
        source: '/admin/configuracoes',
        destination: '/configuracoes/geral',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
