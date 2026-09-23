# Manual de Usuario y Especificación de Carga para Grok Bot
**Sistema Inmobiliario N.I.A. — Oficina REMAX Patrimonio**

Este manual contiene las instrucciones exhaustivas, esquemas de datos, formatos de carpeta y comandos de ejecución para que **Grok Bot** (o cualquier script automatizado) procese la carpeta de Google Drive de REMAX Patrimonio y cargue el inventario completo en el sistema.

---

## 1. Estado Actual de la Base de Datos
- **Catálogo limpio**: Se han eliminado todos los inmuebles y ofertas de prueba previos (`inmuebles: 0`, `ofertas: 0`, `complejos: 0`).
- **Respaldo creado**: Copia de seguridad guardada en `backend/inmobiliaria.db.bak`.
- **Oficina y Asesores Registrados**: La oficina `"REMAX Patrimonio"` y los agentes oficiales están listos en el sistema:
  - **Fátima Montaño** (`59171393801`)
  - **Yamile Cuéllar** (`yamile.cuellar@patrimonio.com`)
  - **Alejandro Coca** (`59157015854`)
  - **David Rodriguez** (`59161366557`)
  - **Carolina Villarroel** (`59170875285`)
  - **Josi Rojas** (`59163563319`)
  - **Mauricio Gil** (`59176009332`)

---

## 2. Métodos de Carga para Grok Bot

### Método 1: Carga Masiva Automática por Archivo JSON (Recomendado)
Grok Bot genera un archivo JSON (por ejemplo `backend/remax_inventario.json`) con la lista de propiedades y ejecuta el importador oficial en terminal:

```bash
# Ejecutar desde la raíz del proyecto (d:\NIA):
backend\venv\Scripts\python backend\import_remax_catalog.py backend\remax_inventario.json
```

**Ventajas**:
- Valida y procesa cientos de inmuebles en segundos.
- Auto-resuelve coordenadas GPS para zonas de Santa Cruz si faltan.
- Asigna automáticamente las ofertas de Venta, Alquiler o Mixtas.
- Genera el índice de búsqueda semántica `search_text` para IA.
- Vincula directamente con los asesores de REMAX Patrimonio.

### Método 2: API REST (HTTP POST)
Endpoint para creación individual:
- **URL**: `POST http://localhost:8010/api/inmuebles`
- **Content-Type**: `application/json`

---

## 3. Estructura y Esquema del JSON de Propiedades

Grok Bot debe producir un archivo con un array de objetos con el siguiente esquema:

```json
[
  {
    "titulo": "Departamento 2 Dormitorios · Condominio Portobello Green",
    "tipo_inmueble": "Departamento",
    "operacion": "Venta",
    "precio_usd": 85000,
    "moneda": "$ (USD)",
    "ciudad": "Santa Cruz de la Sierra",
    "zona": "Equipetrol",
    "direccion": "Calle Los Gomeros y Av. San Martín",
    "lat": -17.766,
    "lng": -63.195,
    "habitaciones": 2,
    "banos": 2,
    "superficie_m2": 78.5,
    "parqueos": 1,
    "baulera": true,
    "amoblado": false,
    "acepta_mascotas": true,
    "piso": "3",
    "estado": "Publicado",
    "ocupacion": "Disponible",
    "descripcion": "Hermoso departamento con acabados de primera, cocina americana equipada, balcón amplio y áreas sociales con piscina y churrasquera.",
    "amenidades": ["Piscina", "Churrasquera", "Seguridad 24/7", "Gimnasio", "Ascensor"],
    "keywords": ["equipetrol", "departamento", "inversion", "lujo", "balcon"],
    "imagenes": [
      "https://res.cloudinary.com/.../foto1.jpg",
      "https://res.cloudinary.com/.../foto2.jpg"
    ],
    "captador_nombre": "Fátima Montaño",
    "captador_whatsapp": "59171393801",
    "complejo_nombre": "Condominio Portobello Green",
    "datos_especificos_json": {
      "piso": "3",
      "expensasBs": 450,
      "aptoAirbnb": true,
      "descuentoContadoPct": 3
    },
    "ofertas": [
      {
        "operacion": "Venta",
        "precio": 85000,
        "moneda": "$ (USD)",
        "estado": "Publicado"
      }
    ]
  }
]
```

---

## 4. Campos y Valores Válidos (Diccionario de Datos)

| Campo | Tipo | Requerido | Valores Permitidos / Descripción |
| :--- | :--- | :---: | :--- |
| `titulo` | `string` | **Sí** | Título claro del inmueble (máx. 120 caracteres). |
| `tipo_inmueble` | `string` | **Sí** | `"Departamento"`, `"Casa"`, `"Proyecto (preventa)"`, `"Comercial"`, `"Terreno"`. |
| `operacion` | `string` | **Sí** | `"Venta"`, `"Alquiler"`, `"Alquiler y Venta"`. |
| `precio_usd` | `float` | **Sí** | Precio numérico (ej: `85000` para venta o `3500` para alquiler). |
| `moneda` | `string` | No | `"$ (USD)"` o `"Bs"`. (Default: `"$ (USD)"` en venta, `"Bs"` en alquiler). |
| `ciudad` | `string` | **Sí** | `"Santa Cruz de la Sierra"` (o `"Cochabamba"`, `"La Paz"`). |
| `zona` | `string` | **Sí** | `"Equipetrol"`, `"Norte"`, `"Sirari"`, `"Centro"`, `"Sur"`, `"Urubó"`, `"Las Palmas"`, `"Canal Isuto"`, etc. |
| `direccion` | `string` | No | Dirección o referencia de la propiedad. |
| `lat`, `lng` | `float` | No | Coordenadas GPS exactas. Si se omiten o son `0`, el importador usa el centro de la zona. |
| `habitaciones` | `int` | No | Cantidad de dormitorios (en Departamentos y Casas). |
| `banos` | `int` | No | Cantidad de baños completos. |
| `superficie_m2`| `float` | No | Superficie total construida o de terreno en metros cuadrados. |
| `parqueos` | `int` | No | Número de espacios de estacionamiento. |
| `baulera` | `boolean` | No | `true` si cuenta con baulera/depósito. |
| `amoblado` | `boolean` | No | `true` si incluye mobiliario. |
| `acepta_mascotas` | `boolean` | No | `true` si se admiten mascotas (Pet friendly). |
| `estado` | `string` | No | `"Publicado"` (visible en mapa/buscador) o `"Borrador"`. |
| `ocupacion` | `string` | No | `"Disponible"`, `"Reservado"`, `"Alquilado"`, `"Vendido"`. |
| `descripcion` | `string` | **Sí** | Texto descriptivo completo. |
| `amenidades` | `array` / `string` | No | Lista de amenidades: piscina, churrasquera, gimnasio, etc. |
| `keywords` | `array` / `string` | No | Etiquetas clave para el motor de búsqueda por lenguaje natural. |
| `imagenes` | `array` / `string` | No | URLs públicas de imágenes de alta calidad (Cloudinary o Drive). |
| `captador_nombre` | `string` | No | Nombre del asesor REMAX (ej: `"Fátima Montaño"`). |
| `captador_whatsapp` | `string`| No | Número con código internacional sin espacios (ej: `"59171393801"`). |
| `complejo_nombre` | `string` | No | Nombre del edificio o condominio. |

---

## 5. Especificaciones por Arquetipo de Inmueble

### A. Para Casas
En `datos_especificos_json`:
```json
{
  "superficieConstruidaM2": 280,
  "superficieTerrenoM2": 350,
  "niveles": 2,
  "jardinM2": 80,
  "parqueosTechados": 2,
  "esCondominioCerrado": true
}
```

### B. Para Proyectos en Preventa
Para edificios o urbanizaciones en desarrollo:
- `tipo_inmueble`: `"Proyecto (preventa)"`
- `fecha_entrega`: `"Diciembre 2026"` o `"2027"`
- `fase_obra`: `"En planos"`, `"En pozo"`, `"Estructura"`, `"Obra gruesa"`, `"Terminaciones"`
- `avance_obra`: Porcentaje numérico de `0` a `100` (ej: `35`)
- En `datos_especificos_json`:
```json
{
  "total_unidades": 48,
  "unidades_disponibles": 16,
  "pisos": 12,
  "reserva_usd": 2000,
  "precio_m2_desde": 1150,
  "brochure_url": "https://...",
  "planes_pago": "20% cuota inicial, 40% durante construcción, 40% contra entrega",
  "unidades": [
    {
      "tipo": "Studio",
      "dormitorios": 0,
      "banos": 1,
      "superficieM2": 32,
      "precioDesde": 42000
    },
    {
      "tipo": "1 Dormitorio",
      "dormitorios": 1,
      "banos": 1,
      "superficieM2": 45,
      "precioDesde": 58000
    },
    {
      "tipo": "2 Dormitorios",
      "dormitorios": 2,
      "banos": 2,
      "superficieM2": 72,
      "precioDesde": 89000
    }
  ]
}
```

### C. Para Terrenos
- `tipo_inmueble`: `"Terreno"`
- `dimensiones`: `"15m de frente x 35m de fondo"`
- `superficie_m2`: `525`
- `servicios_basicos`: `"Agua potable, Energía eléctrica, Gas domiciliario, Pavimento"`
- En `datos_especificos_json`:
```json
{
  "frenteMetros": 15,
  "fondoMetros": 35,
  "topografia": "Plano",
  "usoSuelo": "Residencial / Comercial Mixto"
}
```

### D. Para Comerciales (Oficinas / Locales / Galpones)
- `tipo_inmueble`: `"Comercial"`
- `subtipo_comercial`: `"Oficina"`, `"Local comercial"` o `"Galpón"`
- En `datos_especificos_json`:
```json
{
  "tipoInmuebleComercial": "Oficina",
  "pisosEdificio": 1,
  "banosPublicos": 2,
  "cargaElectrica": "Trifásica"
}
```

---

## 6. Coordenadas de Referencia para Zonas de Santa Cruz

Si Grok Bot no dispone del pin GPS exacto de una propiedad, el importador automáticamente asignará estas coordenadas precisas:

| Zona | Latitud (`lat`) | Longitud (`lng`) |
| :--- | :---: | :---: |
| **Equipetrol** | `-17.766` | `-63.195` |
| **Norte (Av. Banzer)** | `-17.745` | `-63.170` |
| **Urubó** | `-17.760` | `-63.220` |
| **Sirari** | `-17.762` | `-63.190` |
| **Centro / Casco Viejo** | `-17.783` | `-63.182` |
| **Las Palmas** | `-17.805` | `-63.200` |
| **Canal Isuto / Radial 26** | `-17.760` | `-63.185` |
| **Sur (Av. San Aurelio / Santos Dumont)** | `-17.820` | `-63.185` |
| **San Carlos / Ichilo** | `-17.335` | `-63.725` |

---

## 7. Organización Sugerida en la Carpeta de Google Drive

Para facilitar la lectura automática de Grok Bot, la carpeta de Google Drive (`1B1QqnnLELwm-B_at6oIX-cr7RrUnUYHU`) se recomienda organizar por subcarpetas individuales:

```text
REMAX Patrimonio Trompillo/
├── [DEPTO] - Condominio STONE IV - Norte - 70900 USD/
│   ├── ficha.txt (o texto con precio, expensas, detalles, asesor)
│   ├── 01_fachada.jpg
│   ├── 02_living.jpg
│   ├── 03_cocina.jpg
│   └── 04_dormitorio.jpg
├── [CASA] - Barrio Las Palmas - 280000 USD/
│   ├── ficha.txt
│   ├── 01_fachada.jpg
│   └── ...
└── [PREVENTA] - ONA Residences - Norte - 40375 USD/
    ├── brochure.pdf
    ├── datos_preventa.json
    └── ...
```

---

## 8. Verificación Post-Carga
Una vez que Grok Bot termine la ejecución de `import_remax_catalog.py`, puede validar el catálogo accediendo a:
- **Visualizador público (Mapa y Buscador)**: `http://localhost:3001`
- **Panel Administrativo del Catálogo**: `http://localhost:3001/admin/catalog`
- **API Endpoint de Verificación**: `GET http://localhost:8010/api/inmuebles/admin`
