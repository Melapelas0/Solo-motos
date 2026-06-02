1. Crear un entorno virtual " python -m venv venv "
2. Activarlo venv\Scripts\activate
3. Instalar las dependencias necesarias: " pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic "
pip install "python-jose[cryptography]" "passlib[bcrypt]"                          
4. Guardar en requirements " pip freeze > requirements.txt "
5. Ejecutar " uvicorn app.main:app --reload "

cd "c:\Users\ASUS\Pictures\Michael\Proyectos Reales\SoloMotos\backend"
Si es la primera vez, instalar dependencias Python:

pip install -r requirements.txt
Iniciar el backend:

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Abrir otra terminal y entrar al directorio del frontend:

cd "c:\Users\ASUS\Pictures\Michael\Proyectos Reales\SoloMotos\frontend"
Si es la primera vez, instalar dependencias npm:

npm install
Iniciar el frontend:

npm run dev
URLs
Frontend: http://localhost:5173
Backend: http://localhost:8000
Documentación Swagger del backend: http://localhost:8000/docs