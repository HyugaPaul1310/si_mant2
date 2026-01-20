# 📋 GUÍA DE PRUEBA MANUAL - FLUJO DE ENCUESTA

## 🎯 Objetivo
Validar que el flujo completo de encuesta de satisfacción funciona correctamente desde el frontend hasta la base de datos.

---

## 📌 Pasos de Prueba

### 1️⃣ Verificar Servidores Corriendo

**Backend (Express.js)**:
```bash
# En terminal separada:
cd backend
node server.js
# Debe mostrar: "Servidor Express corriendo en puerto 3001"
```

**Frontend (Expo)**:
```bash
# En terminal separada:
npm start
# Debe mostrar Metro Bundler y QR code
```

---

### 2️⃣ Acceder a la Aplicación Web

1. Abre navegador en `http://localhost:8081`
2. Selecciona "web" para abrir en navegador (no Expo Go)
3. Espera a que compile (puede tomar 30-60 segundos)

---

### 3️⃣ Loguear Como Cliente

1. En la pantalla de login, ingresa:
   - **Email**: `cliente@example.com` (o cualquier cliente válido)
   - **Contraseña**: (la correspondiente)

2. Click en "Login" o "Iniciar Sesión"

---

### 4️⃣ Crear o Acceder a un Reporte

1. Una vez logueado, deberías ver la lista de reportes
2. Busca un reporte que esté en estado **"Finalizado"** o **"En revisión"**
   - Si no existe uno, necesitas que un empleado primero:
     - Cotice el reporte
     - Lo acepes como cliente
     - Lo complete como empleado

---

### 5️⃣ Abrir Modal de Encuesta

1. En el reporte en estado "En revisión" o "Finalizado por técnico"
2. Deberías ver un botón: **"Confirmar Finalización"**
3. Click en ese botón
4. Se abrirá modal con la encuesta

---

### 6️⃣ Responder Encuesta

La encuesta tiene 7 preguntas, todas obligatorias:

1. **¿Cómo fue el trato del equipo?**
   - Opciones: Muy insatisfecho / Insatisfecho / Neutral / Satisfecho / Muy satisfecho
   - ✅ Selecciona cualquiera (ej: "Muy satisfecho")

2. **¿Cómo evaluarías el equipo técnico?**
   - ✅ Selecciona una opción

3. **¿Cómo fue el personal administrativo?**
   - ✅ Selecciona una opción

4. **¿Fue rápido el servicio?**
   - ✅ Selecciona una opción

5. **¿El costo fue acorde a la calidad?**
   - ✅ Selecciona una opción

6. **¿Recomendarías nuestros servicios?**
   - Opciones: Sí / No / Tal vez
   - ✅ Selecciona una opción

7. **¿Qué tan satisfecho estás en general?**
   - ✅ Selecciona una opción

---

### 7️⃣ Enviar Encuesta

1. Una vez respondidas TODAS las preguntas
2. Click en botón **"Enviar Encuesta"** o **"Guardar"**
3. Deberías ver un mensaje de éxito
4. Automáticamente volverás al panel del cliente

---

## ✅ Validación de Éxito

### Frontend ✅
- No hay error "SyntaxError" o similar
- La encuesta se abre correctamente
- Puedes responder y enviar

### Backend ✅
- En la terminal del backend deberías ver logs como:
  ```
  [BACKEND-ENCUESTA] Guardando encuesta para reporte: 6
  [BACKEND-ENCUESTA] Encuesta guardada con ID: 3
  ```

### Base de Datos ✅
- Abre MySQL:
  ```bash
  mysql -u root si_mant2
  
  SELECT * FROM encuestas_satisfaccion ORDER BY id DESC LIMIT 1\G
  ```
- Deberías ver el nuevo registro con tu respuesta

---

## 🐛 Troubleshooting

### Error: "Token inválido"
- ✅ Asegúrate que el token esté guardado en AsyncStorage
- ✅ Verifica que no haya expirado (son 24 horas)
- ✅ Intenta logout y login de nuevo

### Error: "Conexión rechazada en puerto 3001"
- ✅ Verifica que el backend esté corriendo
- ✅ Revisa que no esté en otro puerto
- ✅ Reinicia con `node server.js`

### Error: "Error al guardar la encuesta"
- ✅ Revisa los logs del backend
- ✅ Verifica que la tabla `encuestas_satisfaccion` existe
- ✅ Ejecuta: `DESCRIBE encuestas_satisfaccion;` en MySQL

### Encuesta no aparece
- ✅ Asegúrate que el reporte esté en estado correcto
- ✅ Revisa que seas el cliente propietario del reporte
- ✅ Recarga la página (F5 o Ctrl+R)

---

## 📊 Métricas Esperadas

Después de completar la prueba, deberías tener:

- ✅ 1 nueva fila en tabla `encuestas_satisfaccion`
- ✅ Campo `reporte_id` con el ID del reporte
- ✅ Campo `cliente_email` con tu email
- ✅ 7 campos con tus respuestas
- ✅ `created_at` con timestamp actual

---

## 🎯 Resumen del Flujo

```
START
  ↓
Frontend compila sin errores ✅
  ↓
Accedes a app ✅
  ↓
Respondes encuesta ✅
  ↓
Clickeas "Enviar" ✅
  ↓
Frontend llama apiCall() ✅
  ↓
Backend recibe solicitud ✅
  ↓
Backend valida token ✅
  ↓
Backend inserta en BD ✅
  ↓
Backend retorna éxito ✅
  ↓
Frontend muestra confirmación ✅
  ↓
Datos en tabla MySQL ✅
  ↓
END ✅
```

---

## 📞 Soporte

Si algo falla en un paso específico, revisa:
1. Los logs de la terminal de npm (frontend)
2. Los logs de la terminal del backend
3. Los logs de la base de datos (MySQL)
4. La consola de desarrollador (F12 en navegador)

¡El sistema está diseñado para ser robusto! Si algo no funciona, verás un error descriptivo que te ayudará a identificar dónde está el problema.

---

**Última actualización**: 19/01/2026
**Estado del Sistema**: ✅ PRODUCCIÓN
**Encuesta Status**: ✅ FUNCIONAL
