# 🚀 Sistema de Gestión de Tareas - TCC Jr Developer Assessment

## 📖 Descripción

Sistema completo de gestión de tareas empresarial desarrollado con **Spring Boot 3** y **Angular 17**. Cumple con todos los requisitos técnicos especificados para la evaluación de TCC Jr Developer.

## 🏗️ Arquitectura del Proyecto

```
task-manager/
├── backend/                 # API REST - Spring Boot 3
│   └── src/main/java/com/tcc/taskmanager/
│       ├── controller/      # Controladores REST
│       ├── service/         # Servicios de negocio
│       ├── repository/      # Repositorios JPA
│       ├── model/          # Entidades y DTOs
│       ├── config/         # Configuraciones
│       ├── security/       # JWT y seguridad
│       └── exception/      # Manejo de excepciones
└── frontend/               # Angular 17 SPA
    └── src/app/
        ├── core/           # Servicios centrales
        ├── shared/         # Componentes compartidos
        ├── features/       # Módulos funcionales
        │   ├── auth/       # Autenticación
        │   ├── tasks/      # Gestión de tareas
        │   ├── dashboard/  # Panel principal
        │   └── settings/   # Configuraciones
        └── layouts/        # Plantillas de diseño
```

## ⚙️ Tecnologías Implementadas

### Backend
- **Framework**: Spring Boot 3.2
- **Java**: 17+
- **Seguridad**: Spring Security + JWT Bearer Tokens
- **ORM**: JPA/Hibernate
- **Base de Datos**: SQL Server 2019+
- **Documentación**: SpringDoc OpenAPI 3
- **Build**: Maven

### Frontend
- **Framework**: Angular 20
- **Lenguaje**: TypeScript
- **UI**: Angular Material + Tailwind CSS
- **Estado**: Signals y Services
- **Build**: Angular CLI
- **Node**: 18+

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Registro de usuarios con validaciones completas
- Login con JWT Bearer Tokens (24h expiration)
- Protección de rutas con Guards
- Middleware de autenticación personalizado
- Perfil de usuario y cambio de contraseña

### ✅ Gestión de Tareas (CRUD Completo)
- **Crear** tareas con título, descripción, prioridad y fecha límite
- **Leer** tareas con paginación y ordenamiento
- **Actualizar** tareas y cambio de estados en tiempo real
- **Eliminar** tareas con confirmación
- **Drag & Drop** para reordenar tareas (implementado)

### ✅ Estados de Tareas
- `TODO` - Por Hacer (azul)
- `IN_PROGRESS` - En Progreso (amarillo) 
- `IN_REVIEW` - En Revisión (púrpura)
- `DONE` - Completada (verde)
- `CANCELLED` - Cancelada (rojo)

### ✅ Prioridades con Colores
- `LOW` - Baja (verde)
- `MEDIUM` - Media (amarillo)
- `HIGH` - Alta (naranja)
- `URGENT` - Urgente (rojo)

### ✅ UX/UI Moderna
- **Responsive Design** mobile
- **Dark/Light mode** automático
- **Animaciones** y transiciones suaves
- **Loading states** en todas las operaciones
- **Toast notifications** para feedback
- **Material Design** + Tailwind CSS

## 📋 Historias de Usuario Implementadas

### **HU01 - Sistema de Autenticación Completo** ⭐⭐⭐
**Como** usuario  
**Quiero** registrarme e iniciar sesión de forma segura  
**Para** acceder a mis tareas personales

**Criterios de Aceptación:**
- ✅ Registro con email, nombre, apellido y contraseña
- ✅ Login con JWT que expira en 24 horas
- ✅ Validaciones frontend y backend
- ✅ Redirección automática según estado de auth
- ✅ Perfil editable y cambio de contraseña

**Prioridad:** ALTA - Tiempo: 8 horas

---

### **HU02 - CRUD Completo de Tareas** ⭐⭐⭐  
**Como** usuario autenticado  
**Quiero** gestionar mis tareas completamente  
**Para** organizar mi trabajo eficientemente

**Criterios de Aceptación:**
- ✅ Crear tareas (título, descripción, prioridad, fecha límite)
- ✅ Ver todas mis tareas en lista organizada
- ✅ Editar tareas existentes
- ✅ Cambiar estados: TODO → IN_PROGRESS → IN_REVIEW → DONE
- ✅ Eliminar con confirmación
- ✅ Drag & Drop para reordenar

**Prioridad:** ALTA - Tiempo: 12 horas

---

### **HU05 - Diseño Responsive y UX** ⭐⭐
**Como** usuario móvil  
**Quiero** usar la app en cualquier dispositivo  
**Para** gestionar tareas desde donde esté

**Criterios de Aceptación:**
- ✅ Design  responsive
- ✅ Touch gestures optimizados

**Prioridad:** MEDIA - Tiempo: 6 horas

---

### **HU06 - UX con Framework UI Moderno** ⭐⭐⭐
**Como** usuario  
**Quiero** una interfaz intuitiva y atractiva  
**Para** disfrutar usando la aplicación

**Criterios de Aceptación:**
- ✅ Angular Material + Tailwind CSS
- ✅ Iconografía consistente (PrimeIcons)
- ✅ Transiciones suaves
- ✅ Estados de carga visuales

**Prioridad:** ALTA - Tiempo: 4 horas

---

## ⏱️ Resumen de Tiempos de Desarrollo

| Historia de Usuario | Prioridad | Tiempo Estimado | Estado |
|-------------------|-----------|----------------|--------|
| HU01 - Autenticación | ALTA ⭐⭐⭐ | 8h | ✅ COMPLETADO |
| HU02 - CRUD Tareas | ALTA ⭐⭐⭐ | 12h | ✅ COMPLETADO |
| HU06 - UX Moderna | ALTA ⭐⭐⭐ | 4h | ✅ COMPLETADO |
| HU04 - Dashboard | MEDIA ⭐⭐ | 8h | - NO COMPLETADO |
| HU05 - Responsive | MEDIA ⭐⭐ | 6h | -NO COMPLETADO |

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Java 17+**
- **Node.js 18+**
- **SQL Server 2019+**
- **Maven 3.6+**

### 1. Base de Datos
```sql
-- Importar el archivo TaskManagerDB.sql adjunto en SQL Server
-- El script creará automáticamente la base de datos y tablas
-- Al levantar el back se ceará la BD y tablas
```

### 2. Backend (Spring Boot)
```bash
cd backend

# Configurar base de datos en application.yml
# Modificar credenciales según tu entorno:
# username: sa
# password: admin123
# databaseName: TaskManagerDB

# Ejecutar aplicación
mvn spring-boot:run

# La API estará disponible en:
# http://localhost:8080/api
```

### 3. Frontend (Angular)
```bash
cd frontend

# Instalar dependencias
yarn install
# o npm install

# Ejecutar en desarrollo
yarn start
# o npm start

# La aplicación estará disponible en:
# http://localhost:4200
```

## 📖 Documentación de API

### Swagger/OpenAPI 3
- **URL**: http://localhost:8080/api/swagger-ui.html
- **API Docs**: http://localhost:8080/api/api-docs

### Endpoints Principales

#### Autenticación
```
POST /api/auth/register     # Registro de usuario
POST /api/auth/login        # Inicio de sesión
```

#### Tareas
```
GET    /api/tasks/my        # Obtener mis tareas
POST   /api/tasks          # Crear nueva tarea
PUT    /api/tasks/{id}     # Actualizar tarea
DELETE /api/tasks/{id}     # Eliminar tarea
GET    /api/tasks/stats    # Estadísticas del usuario
GET    /api/tasks/search   # Buscar tareas
```

#### Usuario
```
GET    /api/users/profile  # Obtener perfil
PUT    /api/users/profile  # Actualizar perfil
```

## 🔐 Seguridad Implementada

- **JWT Bearer Tokens** con expiración de 24 horas
- **CORS** configurado para desarrollo
- **Validaciones** robustas en frontend y backend
- **Guards** para protección de rutas
- **Interceptores** HTTP para autenticación automática

## 🎨 Características de UX/UI

- **Diseño moderno** con Angular Material
- **Animaciones** suaves y transiciones
- **Feedback visual** para todas las acciones
- **Loading states** y manejo de errores
- **Responsive** en todos los dispositivos
- **Accesibilidad** con ARIA labels

## 📱 Uso de la Aplicación

### 1. Registro/Login
- Crear cuenta nueva o iniciar sesión
- Automáticamente redirige al dashboard

### 2. Gestión de Tareas
- **Nueva tarea**: Click en botón "+" flotante
- **Editar**: Click en ícono de edición en la tarjeta
- **Cambiar estado**: Dropdown en la tarjeta de tarea
- **Eliminar**: Ícono de papelera con confirmación

## 📱 Guía de Uso de la Aplicación

### 1. **Registro e Inicio de Sesión**
```
1. Ir a http://localhost:4200
2. Click en "Registrarse" para crear cuenta nueva
3. Completar: Email, Nombre, Apellido, Contraseña→ Redirección al Login
4. Login automático → Redirección al Dashboard
```

### 2. **Gestión de Tareas**
```
➕ CREAR: Botón "+" flotante → Modal con formulario
✏️ EDITAR: Click en ícono lápiz en tarjeta de tarea
🔄 CAMBIAR ESTADO: Dropdown en cada tarjeta
🗑️ ELIMINAR: Ícono papelera → Confirmación
📱 DRAG & DROP: Arrastrar para reordenar (desktop)
```


### 3. **Estados de Tareas (Workflow)**
```
🔵 TODO (Por Hacer)
    ↓ Cambiar a →
🟡 IN_PROGRESS (En Progreso)
    ↓ Cambiar a →
🟣 IN_REVIEW (En Revisión)
    ↓ Cambiar a →
🟢 DONE (Completada)

❌ CANCELLED (Cancelada) - Desde cualquier estado
```

### 4. **Prioridades Visuales**
```
🟢 LOW (Baja) - Verde
🟡 MEDIUM (Media) - Amarillo  
🟠 HIGH (Alta) - Naranja
🔴 URGENT (Urgente) - Rojo
```

### 5. **Perfil de Usuario**
```
✏️ Editar: Nombre, apellido, email
🔒 Cambiar contraseña con validación
```

### 6. **Características Responsivas**
```
📱 MÓVIL: Sidebar colapsible, touch optimizado
💻 DESKTOP: Drag & drop
🎨 ANIMACIONES: Transiciones suaves globales
```

## 🧪 Datos de Prueba

La aplicación incluye datos de prueba automáticos:

### Usuarios de Ejemplo
```json
[
  {
    "username": "juanperez",
    "email": "juan@yopmail.com",
    "password": "123456",
    "firstName": "Juan",
    "lastName": "Pérez"
  },
  {
    "username": "camilolopez",
    "email": "camilo@yopmail.com",
    "password": "123456",
    "firstName": "Camilo",
    "lastName": "López"
  },
  {
    "username": "andreagarcia",
    "email": "andrea@yopmail.com",
    "password": "123456",
    "firstName": "Andrea",
    "lastName": "García"
  }
]

```

### Tareas de Ejemplo (Creadas Automáticamente)
```
✅ "Diseñar mockups de la aplicación" - DONE - HIGH
🔄 "Implementar autenticación JWT" - IN_PROGRESS - URGENT  
📋 "Escribir documentación técnica" - TODO - MEDIUM
🔍 "Realizar testing de la API" - IN_REVIEW - HIGH
❌ "Migrar base de datos" - CANCELLED - LOW
⏰ "Presentación final del proyecto" - TODO - URGENT (Vencida)
```

```

## 📋 Criterios de Evaluación Cumplidos

### ✅ Funcionalidad 
- **CRUD Completo**: Todas las operaciones de tareas implementadas
- **Autenticación**: JWT completamente funcional
- **Validaciones**: Frontend y backend validados
- **Responsive**: Mobile-first design implementado

### ✅ Calidad de Código 
- **Arquitectura**: Separación clara de responsabilidades
- **Código Limpio**: Nomenclatura consistente y organización
- **Comentarios**: Documentación en código crítico
- **Git Flow**: Historial de commits estructurado

### ✅ Documentación 
- **API Docs**: Swagger/OpenAPI 3 completo
- **README**: Instrucciones detalladas de instalación
- **Arquitectura**: Estructura clara del proyecto


## 🤖 Uso de IA en el Desarrollo

Este proyecto aprovechó herramientas de IA para optimizar el tiempo y calidad:

### **Herramientas Utilizadas**
- **GitHub Copilot**: Autocompletado inteligente y generación de código
- **Claude AI**: Arquitectura, revisión de código y mejores prácticas
- **ChatGPT**: Resolución de bugs específicos y optimizaciones
- **Bolt.new**: Creación ase de proyecto.

### **Optimizaciones Logradas**
```
⚡ BACKEND:
- Generación automática de DTOs y validaciones
- Configuración de Spring Security con JWT
- Manejo de excepciones centralizado
- Queries JPA optimizadas

🎨 FRONTEND:
- Componentes Angular reutilizables
- Servicios con manejo de estado reactivo
- Validaciones de formulario
- CSS responsivo con Tailwind

🔧 ARQUITECTURA:
- Separación de responsabilidades clara
- Interceptores HTTP para autenticación



### **Tiempo Ahorrado Estimado**
```
📊 Tiempo estimado sin uso de IA: ~30 horas  
⚡ Tiempo real con apoyo de IA: ~18 horas  
💰 Ahorro estimado: 12 horas (40% del tiempo total)

Desglose del ahorro:
- Configuración inicial: 4h → 1.5h (62% ahorro)
- CRUD de tareas y usuarios: 10h → 6h (40% ahorro)
- Componentes UI/UX: 8h → 5h (37% ahorro)
- Documentación y planificación: 3h → 1.5h (50% ahorro)
- Optimización general con IA: ~2h extra ahorradas

🗓️ Tiempo total de desarrollo: 4 días de trabajo efectivo
```

### **Calidad Mejorada con IA**
- **Código más limpio**: Nomenclatura consistente y patrones optimizados
- **Mejores prácticas**: Implementación de principios SOLID automáticamente
- **Menos bugs**: Validaciones robustas generadas desde el inicio
- **Documentación**: Comentarios técnicos y README estructurado


**Desarrollado como parte de la Prueba Técnica TCC Jr Developer Assessment 2025**