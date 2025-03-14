import pystache
import os
from typing import Optional, Dict, Any

class TemplateService:
    TEMPLATE_DIR = os.path.join('app', 'templates')
    
    @classmethod
    def ensure_template_directory(cls) -> None:
        """Crée le répertoire des templates s'il n'existe pas."""
        os.makedirs(cls.TEMPLATE_DIR, exist_ok=True)
    
    @classmethod
    def render_template(cls, template_name: str, data: Dict[str, Any]) -> Optional[str]:
        """
        Rend un template Mustache avec les données fournies.
        
        Args:
            template_name (str): Le nom du template (sans l'extension .mustache)
            data (dict): Les données à injecter dans le template
            
        Returns:
            Optional[str]: Le contenu du template rendu ou None en cas d'erreur
        """
        cls.ensure_template_directory()
        template_path = os.path.join(cls.TEMPLATE_DIR, f'{template_name}.mustache')
        
        print(f"[DEBUG] Tentative de chargement du template: {template_path}")
        print(f"[DEBUG] Données pour le template: {data}")
        
        try:
            if not os.path.exists(template_path):
                raise FileNotFoundError(
                    f"Le fichier template '{template_path}' n'existe pas. "
                    "Assurez-vous que le fichier existe dans le dossier templates."
                )
            
            with open(template_path, 'r', encoding='utf-8') as file:
                template_content = file.read()
                
            if not template_content.strip():
                raise ValueError("Le fichier template est vide")
                
            rendered_content = pystache.render(template_content, data)
            
            print(f"[DEBUG] Template rendu avec succès. Longueur: {len(rendered_content)}")
            return rendered_content
            
        except FileNotFoundError as e:
            print(f"[ERREUR] {str(e)}")
            print(f"[INFO] Dossier actuel: {os.getcwd()}")
            print(f"[INFO] Contenu du dossier templates: {os.listdir(cls.TEMPLATE_DIR) if os.path.exists(cls.TEMPLATE_DIR) else 'Dossier non trouvé'}")
            return None
            
        except Exception as e:
            print(f"[ERREUR] Erreur lors du rendu du template '{template_name}': {str(e)}")
            return None