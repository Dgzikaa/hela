"""
Bot de Rifa RagnaTales - Rafa da Rifa
=====================================

Este bot monitora o texto do NPC Rafa da Rifa, identifica qual rifa esta ativa,
consulta a calculadora para verificar se vale a pena, e joga automaticamente.

Requisitos:
- Python 3.8+
- pip install -r requirements.txt

Uso:
1. Configure as posicoes da tela em config.json
2. Execute: python rifa_bot.py
3. Pressione F10 para ativar/desativar auto-play
4. Pressione ESC para sair
"""

import json
import time
import sys
import os
from datetime import datetime
from typing import Optional, Dict, Any
import threading
import numpy as np

# Imports condicionais para tratamento de erros
try:
    import pyautogui
    import keyboard
    from PIL import Image
    import mss
    import requests
except ImportError as e:
    print(f"[ERRO] Erro de importacao: {e}")
    print("Execute: pip install -r requirements.txt")
    sys.exit(1)

# Tenta importar EasyOCR
try:
    import easyocr
    OCR_ENGINE = "easyocr"
except ImportError:
    try:
        import pytesseract
        OCR_ENGINE = "tesseract"
    except ImportError:
        print("[ERRO] Nenhum OCR disponivel. Instale easyocr ou pytesseract")
        sys.exit(1)

# Configuracoes PyAutoGUI
pyautogui.FAILSAFE = True  # Move mouse para canto = para tudo
pyautogui.PAUSE = 0.1

# ==========================================
# CLASSE PRINCIPAL DO BOT
# ==========================================

class RifaBot:
    def __init__(self, config_path: str = "config.json"):
        self.config = self.load_config(config_path)
        self.running = False
        self.auto_play = self.config.get("auto_play", False)
        self.plays_count = 0
        self.total_spent = 0
        self.last_rifa_id = None
        self.reader = None
        
        # Inicializa OCR
        if OCR_ENGINE == "easyocr":
            print("[INFO] Inicializando EasyOCR (pode demorar na primeira vez)...")
            self.reader = easyocr.Reader(['pt', 'en'], gpu=False)
            print("[OK] EasyOCR pronto!")
        
        # Dados das rifas
        self.rifas_data = self.load_rifas_data()
        
    def load_config(self, path: str) -> Dict[str, Any]:
        """Carrega configuracao do arquivo JSON"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"[AVISO] Config nao encontrado, usando padroes")
            return {
                "api_url": "http://localhost:3000",
                "check_interval_seconds": 3,
                "auto_play": False,
                "debug_mode": True,
            }
    
    def load_rifas_data(self) -> Dict[int, Dict]:
        """Carrega dados das rifas da API ou usa cache local"""
        # Dados das 14 rifas com precos e chances
        return {
            1: {"preco": 180000, "principal": "Caixa Consumiveis A", "consolacao": "Caixa Consumiveis B", "chance": 3},
            2: {"preco": 180000, "principal": "Caixa Consumiveis C", "consolacao": "Caixa Consumiveis D", "chance": 3},
            3: {"preco": 180000, "principal": "Caixa Consumiveis E", "consolacao": "Caixa Consumiveis F", "chance": 3},
            4: {"preco": 180000, "principal": "Medicina Milagrosa", "consolacao": "Pergaminho do Eden", "chance": 1},
            5: {"preco": 300000, "principal": "Espelho Convexo", "consolacao": "Amuleto de Ziegfried", "chance": 1},
            6: {"preco": 300000, "principal": "Caixa Auxiliares A", "consolacao": "Caixa Conversores Etereos", "chance": 0.5},
            7: {"preco": 300000, "principal": "Caixa Consumiveis Dourados", "consolacao": "Doce de Elvira", "chance": 0.5},
            8: {"preco": 360000, "principal": "Pocao de Guyak", "consolacao": "Pocao do Vento", "chance": 1},
            9: {"preco": 600000, "principal": "Salada de Frutas", "consolacao": "Trouxinha de Comidas", "chance": 2},
            10: {"preco": 300000, "principal": "Caixa Municoes Douradas", "consolacao": "Caixa Conversores Elementais", "chance": 0.5},
            11: {"preco": 300000, "principal": "Caixa Auxiliares B", "consolacao": "Caixa Suprimentos Classe", "chance": 0.5},
            12: {"preco": 300000, "principal": "Caixa Ingredientes Dourados", "consolacao": "Caixa de Xaropes", "chance": 0.5},
            13: {"preco": 300000, "principal": "Pocao Mental", "consolacao": "Incenso Queimado", "chance": 3},
            14: {"preco": 300000, "principal": "Pedra de Selamento Dourada", "consolacao": "Caixa Consumiveis G", "chance": 0.03},
        }
    
    def capture_screen_region(self, region: Dict) -> Image.Image:
        """Captura uma regiao especifica da tela"""
        with mss.mss() as sct:
            monitor = {
                "left": region["x"],
                "top": region["y"],
                "width": region["width"],
                "height": region["height"]
            }
            screenshot = sct.grab(monitor)
            return Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
    
    def read_text_from_image(self, image: Image.Image) -> str:
        """Extrai texto de uma imagem usando OCR"""
        if OCR_ENGINE == "easyocr":
            # EasyOCR precisa de numpy array
            img_array = np.array(image)
            result = self.reader.readtext(img_array, detail=0, paragraph=True)
            return " ".join(result) if result else ""
        else:
            return pytesseract.image_to_string(image, lang='por')
    
    def identify_rifa(self, text: str) -> Optional[int]:
        """Identifica qual rifa esta ativa baseado no texto"""
        text_lower = text.lower()
        keywords = self.config.get("rifas_keywords", {})
        
        for rifa_id, words in keywords.items():
            for word in words:
                if word.lower() in text_lower:
                    return int(rifa_id)
        
        return None
    
    def check_if_worth_playing(self, rifa_id: int) -> Dict[str, Any]:
        """Consulta a API para verificar se a rifa vale a pena"""
        try:
            # Tenta buscar da API local
            response = requests.get(
                f"{self.config['api_url']}/api/rifas/check/{rifa_id}",
                timeout=5
            )
            if response.ok:
                return response.json()
        except:
            pass
        
        # Fallback: calculo local basico
        rifa = self.rifas_data.get(rifa_id, {})
        return {
            "rifa_id": rifa_id,
            "preco": rifa.get("preco", 0),
            "vale_a_pena": False,  # Sem precos, nao joga
            "lucro_estimado": 0,
            "lucro_consolacao": 0,
            "fonte": "local"
        }
    
    def click_npc(self):
        """Clica no NPC para iniciar conversa"""
        pos = self.config["screen_regions"]["npc_click"]
        pyautogui.click(pos["x"], pos["y"])
        time.sleep(0.5)
    
    def click_buy(self):
        """Clica no botao de comprar"""
        pos = self.config["screen_regions"]["buy_button"]
        pyautogui.click(pos["x"], pos["y"])
        time.sleep(0.5)
    
    def click_close(self):
        """Clica no botao de fechar"""
        pos = self.config["screen_regions"]["close_button"]
        pyautogui.click(pos["x"], pos["y"])
        time.sleep(0.3)
    
    def play_rifa(self, rifa_id: int) -> bool:
        """Joga uma rifa"""
        rifa = self.rifas_data.get(rifa_id, {})
        preco = rifa.get("preco", 0)
        
        print(f"[PLAY] Jogando Rifa #{rifa_id} (custo: {preco:,}z)")
        
        try:
            # Clica no NPC
            self.click_npc()
            time.sleep(0.3)
            
            # Clica em comprar
            self.click_buy()
            time.sleep(1)  # Espera animacao do sorteio
            
            # Fecha resultado
            self.click_close()
            
            self.plays_count += 1
            self.total_spent += preco
            
            return True
        except Exception as e:
            print(f"[ERRO] Erro ao jogar: {e}")
            return False
    
    def log(self, message: str):
        """Log com timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
    
    def main_loop(self):
        """Loop principal do bot"""
        self.log("[BOT] Bot de Rifa iniciado!")
        self.log(f"[OCR] Engine: {OCR_ENGINE}")
        self.log(f"[CFG] Auto-play: {'ATIVADO' if self.auto_play else 'DESATIVADO'}")
        self.log("[KEY] F10 = Toggle auto-play | ESC = Sair")
        self.log("-" * 50)
        
        region = self.config["screen_regions"]["rifa_text"]
        interval = self.config.get("check_interval_seconds", 3)
        max_plays = self.config.get("max_plays_per_rifa", 50)
        min_profit = self.config.get("min_profit_to_play", 0)
        
        while self.running:
            try:
                # Captura tela
                image = self.capture_screen_region(region)
                
                # Le texto
                text = self.read_text_from_image(image)
                
                if self.config.get("debug_mode"):
                    self.log(f"[OCR] Texto: {text[:100]}...")
                
                # Identifica rifa
                rifa_id = self.identify_rifa(text)
                
                if rifa_id:
                    # Nova rifa detectada?
                    if rifa_id != self.last_rifa_id:
                        self.log(f"[RIFA] Nova Rifa detectada: #{rifa_id}")
                        self.last_rifa_id = rifa_id
                        self.plays_count = 0  # Reset contador
                    
                    # Verifica se vale a pena
                    check = self.check_if_worth_playing(rifa_id)
                    
                    if check.get("vale_a_pena"):
                        lucro = check.get("lucro_estimado", 0)
                        self.log(f"[OK] Rifa #{rifa_id} vale a pena! Lucro: {lucro:,}z")
                        
                        if self.auto_play:
                            if self.plays_count < max_plays:
                                if lucro >= min_profit:
                                    self.play_rifa(rifa_id)
                                else:
                                    self.log(f"[SKIP] Lucro ({lucro:,}) < minimo ({min_profit:,})")
                            else:
                                self.log(f"[SKIP] Maximo de {max_plays} jogadas atingido")
                    else:
                        lucro = check.get("lucro_consolacao", 0)
                        self.log(f"[NAO] Rifa #{rifa_id} nao vale (lucro consolacao: {lucro:,}z)")
                else:
                    if self.config.get("debug_mode"):
                        self.log("[OCR] Nenhuma rifa identificada no texto")
                
                # Espera intervalo
                time.sleep(interval)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.log(f"[AVISO] Erro: {e}")
                time.sleep(interval)
        
        self.log("-" * 50)
        self.log(f"[STATS] Estatisticas da sessao:")
        self.log(f"   Jogadas: {self.plays_count}")
        self.log(f"   Gasto total: {self.total_spent:,}z")
        self.log("[BOT] Bot encerrado!")
    
    def toggle_auto_play(self):
        """Toggle auto-play com F10"""
        self.auto_play = not self.auto_play
        status = "ATIVADO" if self.auto_play else "DESATIVADO"
        self.log(f"[TOGGLE] Auto-play {status}")
    
    def stop(self):
        """Para o bot"""
        self.running = False
    
    def start(self):
        """Inicia o bot"""
        self.running = True
        
        # Registra hotkeys
        keyboard.add_hotkey('f10', self.toggle_auto_play)
        keyboard.add_hotkey('esc', self.stop)
        
        # Inicia loop em thread separada
        thread = threading.Thread(target=self.main_loop)
        thread.start()
        
        # Espera thread terminar
        thread.join()
        
        # Limpa hotkeys
        keyboard.unhook_all()


# ==========================================
# UTILITARIO: CALIBRACAO DE POSICOES
# ==========================================

def calibrate_positions():
    """Ajuda a calibrar as posicoes da tela"""
    print("\n[CALIBRACAO] MODO CALIBRACAO")
    print("=" * 50)
    print("Mova o mouse para a posicao desejada e pressione ENTER")
    print("Pressione 'q' para sair\n")
    
    positions = {}
    labels = [
        ("rifa_text", "Canto superior esquerdo do texto da rifa"),
        ("rifa_text_end", "Canto inferior direito do texto da rifa"),
        ("npc_click", "Posicao do NPC para clicar"),
        ("buy_button", "Botao 'Sim, eu quero comprar'"),
        ("close_button", "Botao 'fechar'"),
    ]
    
    for key, description in labels:
        print(f"[POS] {description}")
        input("   Pressione ENTER quando estiver na posicao...")
        x, y = pyautogui.position()
        positions[key] = {"x": x, "y": y}
        print(f"   [OK] Capturado: ({x}, {y})\n")
    
    # Calcula regiao do texto
    text_region = {
        "x": positions["rifa_text"]["x"],
        "y": positions["rifa_text"]["y"],
        "width": positions["rifa_text_end"]["x"] - positions["rifa_text"]["x"],
        "height": positions["rifa_text_end"]["y"] - positions["rifa_text"]["y"],
    }
    
    print("\n[CONFIG] Configuracao gerada:")
    print(json.dumps({
        "rifa_text": text_region,
        "npc_click": positions["npc_click"],
        "buy_button": positions["buy_button"],
        "close_button": positions["close_button"],
    }, indent=2))
    
    print("\n[OK] Copie essas configuracoes para config.json")


def test_ocr():
    """Testa o OCR capturando a tela atual"""
    print("\n[TEST] TESTE DE OCR")
    print("=" * 50)
    
    config = {}
    try:
        with open("config.json", 'r', encoding='utf-8') as f:
            config = json.load(f)
    except:
        print("[AVISO] Config nao encontrado, usando regiao padrao")
        config = {
            "screen_regions": {
                "rifa_text": {"x": 160, "y": 90, "width": 300, "height": 80}
            }
        }
    
    region = config["screen_regions"]["rifa_text"]
    print(f"[REGIAO] x={region['x']}, y={region['y']}, {region['width']}x{region['height']}")
    
    # Captura
    print("[CAPTURA] Capturando tela...")
    with mss.mss() as sct:
        monitor = {
            "left": region["x"],
            "top": region["y"],
            "width": region["width"],
            "height": region["height"]
        }
        screenshot = sct.grab(monitor)
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
    
    # Salva imagem para debug
    img.save("debug_capture.png")
    print("[SALVO] Imagem salva em debug_capture.png")
    
    # OCR
    print(f"[OCR] Processando com {OCR_ENGINE}...")
    if OCR_ENGINE == "easyocr":
        reader = easyocr.Reader(['pt', 'en'], gpu=False)
        img_array = np.array(img)
        result = reader.readtext(img_array, detail=0, paragraph=True)
        text = " ".join(result) if result else ""
    else:
        text = pytesseract.image_to_string(img, lang='por')
    
    print(f"\n[TEXTO] Texto detectado:\n{text}")
    

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    print("""
+==================================================+
|     BOT DE RIFA - RAGNATALES                     |
|     Rafa da Rifa Automatizado                    |
+==================================================+
    """)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "calibrate":
            calibrate_positions()
        elif sys.argv[1] == "test":
            test_ocr()
        else:
            print("Uso: python rifa_bot.py [calibrate|test]")
    else:
        bot = RifaBot()
        bot.start()
