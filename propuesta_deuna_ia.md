# Propuesta de Valor: Microcréditos y el Cerebro de IA en Deuna

Este documento presenta un análisis profundo de la arquitectura comercial, el marco regulatorio financiero en el Ecuador, la propuesta de valor de **Deuna Chance** y **Deuna Negocio (Veci)**, y el funcionamiento técnico de los modelos de Inteligencia Artificial que habilitan este ecosistema innovador.

---

## 1. La Problemática Financiera y Social en el Ecuador

El mercado de microfinanzas y crédito de consumo en el Ecuador se enfrenta a una serie de barreras estructurales que limitan la inclusión financiera y perpetúan la informalidad:

### A. La Exclusión por Informalidad
Más del **50% de la población económicamente activa** en el Ecuador trabaja en el sector informal. Esto incluye a miles de microcomerciantes ("Vecis") dueños de tiendas de barrio, panaderías, fruterías, bazares y pequeños emprendedores. Al no tener registros contables formales, declaraciones de impuesto a la renta ni balances auditados, son invisibles para la banca tradicional.

### B. El Alto Costo Operativo (OPEX) Bancario
Para un banco tradicional, los costos de evaluar el riesgo crediticio, originar el préstamo y realizar la cobranza física de montos pequeños (por ejemplo, nanocréditos de $3.50 a $10.00 o microcréditos de $50.00 a $300.00) superan con creces los ingresos que pueden generar mediante las tasas de interés legales. La infraestructura física de oficinas y oficiales de crédito hace que el negocio sea financieramente inviable para montos pequeños.

### C. El Azote del Crédito Informal ("Chulco")
Ante la falta de alternativas formales, los microcomerciantes e individuos recurren a los prestamistas informales usureros ("chulqueros"). Estos cobran tasas de interés extorsivas que oscilan entre el **10% y el 20% diario** o semanal. Si un comerciante pide $100 para comprar mercadería, termina pagando $120 a la semana. Esto destruye el capital de trabajo de los negocios y atrapa a las familias en un ciclo perpetuo de sobreendeudamiento y violencia.

### D. El Dilema del Techo de Usura y la Viabilidad Financiera
El Banco Central del Ecuador (BCE) regula estrictamente las tasas de interés efectivas máximas. Para el segmento de microcrédito minorista y autoempleo, el tope legal ronda el **28% nominal anual**.
* **El desafío del nanocrédito personal:** Si prestamos **$3.50** a 15 días bajo una tasa del 28% anual, el interés generado es de apenas **$0.04** (4 centavos de dólar). Un ingreso de 4 centavos no alcanza a cubrir el costo de enviar el mensaje SMS de confirmación, mucho menos el costo de procesamiento tecnológico de la transacción.
* **Consecuencia:** La banca formal nunca ofrecerá créditos tan pequeños a corto plazo porque perdería dinero en cada operación, dejando a la población desatendida.

---

## 2. La Solución Innovadora de Deuna

**Deuna** resuelve este problema histórico rediseñando el ecosistema de financiamiento mediante tecnología y un profundo entendimiento de la experiencia del usuario (UX) y la regulación local. La solución se divide en dos productos clave:

```mermaid
flowchart TD
    A[Usuario Deuna] --> B{¿Qué perfil tiene?}
    
    B -->|Usuario Persona| C[Deuna Chance]
    C --> C1[Montos: $3.50 | $7.50 | $10.00]
    C --> C2[Plazo: 15 días]
    C --> C3[Costo: $0.00 de Interés + $0.50 Gasto Aplicativo]
    C --> C4[Aceptación transparente: UX 2 clicks y Leer más]
    
    B -->|Comercio / Veci| D[Deuna Negocio]
    D --> D1[Montos: $50.00 a $300.00]
    D --> D2[Plazo: 1, 2 o 3 meses 30/60/90 días]
    D --> D3[Costo: 28% nominal anual + 0.1% mensual de Seguro de Vida]
    D --> D4[Cobro inteligente: Amortización automática por retención de ventas QR 8% o 6%]
```

### A. Deuna Chance (Para Personas)
Diseñado para resolver emergencias inmediatas (pago de transporte, saldo móvil, medicina básica o comida).
* **Montos fijos pre-aprobados:** $3.50, $7.50 o $10.00.
* **Plazo:** 15 días.
* **Estructura legal y transparente:** Para no infringir la ley de usura del BCE y al mismo tiempo hacer sostenible la tecnología, Deuna cobra **0% de interés** sobre el capital y aplica una tarifa plana única de **$0.50** bajo el concepto de **"Gastos de Aplicativos" (Tech Platform Fee)**. El usuario ve exactamente cuánto va a pagar desde el primer segundo de forma transparente.
* **Fricción mínima (2 clics):** Los términos y condiciones están resumidos en una interfaz colapsable `[Leer más...]`. Con un check de consentimiento (Clic 1) y el botón de solicitar (Clic 2), el crédito se deposita de inmediato en la billetera virtual.

### B. Deuna Negocio (Para el "Veci")
Diseñado para financiar capital de trabajo (abastecimiento de inventario rápido para tiendas de barrio, panaderías, etc.).
* **Montos dinámicos:** De $50.00 a $300.00 (el mínimo inicia estrictamente en $50.00 para asegurar un impacto real en el negocio).
* **Plazos flexibles:** El comerciante puede elegir entre **1, 2 o 3 meses** (30, 60 o 90 días) para amortizar la deuda según sus ciclos comerciales.
* **Cumplimiento regulatorio total:** 
  * Se aplica una **Tasa Nominal Anual del 28%**, perfectamente ajustada a las leyes de microcrédito del BCE.
  * Se incorpora un **Seguro de Desgravamen (Vida)** del **0.1% mensual** (calculado legalmente sobre el capital original), protegiendo al comerciante y a su familia en caso de fallecimiento o invalidez.
* **Repago Automatizado (Amortización por Retención de Ventas QR):** Este es el corazón de la innovación. En lugar de exigir que el comerciante acuda a un banco a pagar cuotas mensuales fijas que ahogan su liquidez, Deuna retiene un porcentaje pequeño de cada cobro que el comerciante realiza mediante código QR.
  * **Tasa Base:** 8% de cada venta QR cobrada se destina al pago de la deuda.
  * **Premio por Buen Comportamiento (Cashback/Reducción de Tasa):** Si el comerciante mantiene un comportamiento excelente (veciConsecutiveGoodPayments >= 1), la retención disminuye automáticamente al **6%**, dejando más liquidez diaria libre en su negocio.

---

## 3. Beneficiarios y Usuarios Finales

| Segmento de Usuario | Perfil de Usuario | Principales Necesidades Satisfechas |
| :--- | :--- | :--- |
| **Consumidores Emergentes** | Personas jóvenes, estudiantes, trabajadores independientes y ciudadanos no bancarizados. | Acceso inmediato a montos ultra-pequeños sin papeleos. Eliminación de la necesidad de pedir prestado a familiares o prestamistas de barrio. |
| **Los "Vecis" (Microcomerciantes)** | Propietarios de tiendas de abarrotes, fruterías, bazares, peluquerías y puestos de comida. | Financiación ágil de capital de trabajo para comprar stock o inventario estacional. Amortización imperceptible vinculada a sus ventas reales diarias. |
| **Ecosistema Deuna** | La plataforma transaccional de pagos, comercios afiliados y usuarios finales. | Consolidación de un ecosistema financiero cerrado donde el dinero se presta, se transacciona y se cobra digitalmente sin salir de la app. |

---

## 4. ¿Cómo Beneficia a Deuna?

Este modelo genera un **círculo virtuoso de rentabilidad, tracción y datos** para Deuna:

1. **Crecimiento Exponencial del TPV (Total Payment Volume):** Al vincular el cobro de la deuda al procesamiento del código QR, los comercios ("Vecis") incentivan activamente a sus clientes a pagarles con Deuna ("¡Págueme con QR Deuna!"). Esto dispara el volumen de transacciones en toda la plataforma.
2. **Incremento del Engagement y Gamificación (Club Deuna):** La experiencia del crédito no es aburrida ni estresante. Incorporamos mecánicas de gamificación:
   * **Cofres Inteligentes:** Cofres diarios (Bronce, Plata, Oro) que se desbloquean según el puntaje de confianza.
   * **Tienda de Monedas (Coins):** Monedas virtuales obtenidas por transaccionar y pagar a tiempo, que pueden ser canjeadas por cosméticos visuales premium o boletos para la ruleta.
   * **Ruleta de Premios:** Habilita beneficios reales o lúdicos, manteniendo al usuario conectado diariamente a la app.
3. **Loop de Datos no Tradicionales para Análisis de Riesgo:** Cada acción del usuario (abrir el cofre diario, la consistencia de sus canjes en la tienda, el volumen transaccional, etc.) se convierte en un dato útil. Estos datos alimentan constantemente los algoritmos de IA, perfeccionando la toma de decisiones.
4. **Bancarización y Escalabilidad Financiera (Cross-selling):** Deuna ayuda al comerciante informal a construir un historial de crédito reportado formalmente ante el Buró de Crédito del Ecuador. En el futuro, Deuna o su banco asociado pueden ofrecerles créditos de gran envergadura (créditos comerciales para locales, vehículos, etc.), fidelizando al cliente de por vida.

---

## 5. El Cerebro Detrás del Crédito: Funcionamiento de la IA

La Inteligencia Artificial en Deuna es el motor que permite automatizar decisiones en segundos sin intervención humana, reduciendo el costo operativo a cero y controlando el riesgo de impago. Se divide en dos pilares fundamentales: **Predicciones del Negocio** y el **Score de Confianza (Pulso Score)**.

---

### A. ¿Cómo funcionan las Predicciones de IA en los Negocios?

Este motor predice la salud de caja, la capacidad de pago y el comportamiento futuro del comercio analizando su historial de cobros transaccionales por QR:

```
[Datos Históricos QR] ──> [Modelos de Series Temporales (Prophet + LSTM)] ──> [Predicción del Flujo de Caja Semanal/Mensual] ──> [Establecimiento del Límite de Crédito Seguro ($50 - $300)]
```

#### 1. Predicción del Flujo de Caja Diario y Semanal
* **Tipo de IA/Modelos Utilizados:** Redes Neuronales Recurrentes del tipo **LSTM (Long Short-Term Memory)** y algoritmos de regresión aditiva como **Prophet** de Meta.
* **Cómo Funciona:**
  * Las redes **LSTM** son ideales para analizar secuencias de tiempo porque tienen celdas de memoria capaces de retener información de largo plazo (ej. patrones de ventas mensuales) y descartar ruidos transaccionales temporales (ej. un día atípico con una venta gigante accidental).
  * **Prophet** descompone la serie temporal de transacciones en componentes de tendencia, estacionalidad (efectos del día de la semana, fechas especiales de alta venta como Navidad, Día de la Madre, o fines de mes) y feriados.
  * El algoritmo analiza los últimos 90 días de cobros QR del "Veci" y genera una predicción del flujo de caja neto para los próximos 30, 60 y 90 días con intervalos de confianza matemática superiores al 95%.
* **Función:** Estimar con precisión si el comercio venderá lo suficiente en los próximos meses para cubrir el préstamo sin ahogarse financieramente.

#### 2. Determinación del "Límite de Crédito Dinámico (Cupo IA)"
* **Cómo Funciona:** Con base en el flujo de caja proyectado y el nivel de volatilidad de las ventas, la IA calcula la capacidad de endeudamiento segura del comercio.
* **Función:** El sistema ajusta la oferta del simulador de crédito en tiempo real. Si la IA predice ventas estables y robustas, desplaza la barra del simulador permitiendo solicitar montos de hasta **$300.00**. Si predice volatilidad o una caída de temporada en el sector, restringe el límite a **$50.00** o **$100.00** para proteger tanto al comercio como al capital de Deuna.

#### 3. Optimización Dinámica de la Retención QR
* **Cómo Funciona:** Los algoritmos de optimización predictiva evalúan el comportamiento transaccional del comercio. Si la IA detecta que una retención del **8%** sobre las ventas diarias es muy alta y arriesga la liquidez operativa básica del negocio (por ejemplo, para pagar a sus proveedores de harina o leche), y el comercio tiene un buen historial (`veciConsecutiveGoodPayments >= 1`), el modelo recomienda bajar el porcentaje de retención automática al **6%**.
* **Función:** Lograr el balance perfecto entre repago acelerado de la deuda y la salud financiera del comercio.

---

### B. ¿Cómo se aplica la IA al Score ("Pulso Score") y qué tipo de IA se usa?

El **Pulso Score** es el puntaje crediticio alternativo de Deuna (de 0 a 100). En lugar de usar reportes de centrales de riesgo tradicionales (que suelen estar vacías para usuarios informales), la IA analiza variables de comportamiento digital y psicometría transaccional.

#### 1. Tipos de IA y Algoritmos Utilizados

* **XGBoost (Extreme Gradient Boosting) y LightGBM (Light Gradient Boosting Machine):**
  * **Cómo Funcionan:** Son modelos basados en árboles de decisión ensayados secuencialmente. Cada árbol nuevo se entrena para corregir los errores de clasificación cometidos por los árboles anteriores (método de Gradient Boosting). 
  * **Por qué se usan:** Son extremadamente rápidos y eficientes para procesar grandes bases de datos tabulares con valores heterogéneos y datos faltantes (típico en usuarios informales). Son capaces de detectar correlaciones no lineales complejas (por ejemplo: *"si un usuario transacciona los viernes por la noche AND abre su cofre diario AND canjea monedas de ahorro, su probabilidad de impago disminuye un 14%"*).
  * **Función:** Clasificar al usuario en categorías de riesgo y estimar la probabilidad de que caiga en mora (Default Probability).

* **Isolation Forests (Bosques de Aislamiento):**
  * **Cómo Funciona:** Es un modelo de aprendizaje no supervisado. En lugar de modelar los puntos de datos normales, aísla de forma explícita las anomalías construyendo árboles binarios de decisión sobre atributos aleatorios. Las anomalías se aíslan rápidamente y requieren menos particiones en el árbol.
  * **Función:** Detectar fraudes en tiempo real, tales como auto-préstamos (usuarios pasándose dinero ficticio entre cuentas familiares para simular ventas comerciales y subir artificialmente su score) o simulación de transacciones infladas.

---

#### 2. Variables de Entrada (Features) Alimentadas a la IA del Score

La genialidad del **Pulso Score** radica en que procesa variables conductuales derivadas de la interacción lúdica y transaccional diaria del usuario en la app:

| Categoría de Feature | Variable Específica | Significado Psicológico e Impacto en el Modelo de IA |
| :--- | :--- | :--- |
| **Comportamiento Transaccional** | Frecuencia de cobros QR, saldo promedio en billetera, rapidez de pagos manuales voluntarios. | **Estabilidad Financiera:** Indica la consistencia del flujo de ingresos diarios y la proactividad del cliente en cumplir sus compromisos. |
| **Disciplina y Consistencia (Gamificación)** | Frecuencia de apertura del **Cofre Inteligente** diario (Bronce, Plata, Oro). | **Disciplina Personal:** Abrir el cofre todos los días demuestra regularidad, orden, planeación y alto interés. El modelo asocia esta disciplina comportamental con una probabilidad de morosidad significativamente menor. |
| **Psicología de Ahorro y Consumo** | Hábitos de gasto en la **Tienda de Monedas (Coins)**. | **Aversión al Riesgo y Planificación:** Un usuario que ahorra sus monedas para comprar cosméticos premium de alto valor visual demuestra tolerancia a la gratificación diferida (autocontrol financiero). Un usuario que gasta todo compulsivamente en juegos rápidos de azar puede tener mayor propensión a decisiones de riesgo. |
| **Patrón de Actividad Visual** | Giros en la **Ruleta de Beneficios** y consistencia del perfil digital. | **Lealtad y Engagement:** Interacción saludable con la aplicación. Muestra que el usuario valora su cuenta digital y teme perder los beneficios estéticos y de reputación acumulados en su perfil si incurre en impagos. |

---

#### 3. Cómo Afecta el Score a la Gamificación en Tiempo Real

El **Pulso Score** no es solo un número frío guardado en el servidor; muta visualmente la interfaz y experiencia del usuario de forma dinámica:

* **Evolución del Cofre Inteligente:**
  * **Rango de Score < 56 (Cofre de Bronce 📦):** Acceso a recompensas básicas de monedas. Refleja un perfil de confianza inicial o de riesgo alto.
  * **Rango de Score 56 a 75 (Cofre de Plata 🎁):** Duplica la ganancia de monedas virtuales y añade un porcentaje de probabilidad de obtener artículos cosméticos raros.
  * **Rango de Score >= 76 (Cofre de Oro 👑):** El cofre brilla intensamente con diseño dorado premium. Ofrece las máximas recompensas diarias del club, alta probabilidad de obtener accesorios exclusivos de estatus visual y habilita tasas preferenciales de crédito.
* **Activación de Límites y Condiciones Financieras:** El incremento del Score desbloquea de inmediato límites de crédito de hasta **$300.00** en el simulador y reduce la retención diaria de ventas QR al **6%**.

---

## 6. Conclusión: El Círculo Virtuoso de Deuna

La propuesta de valor de Deuna integra perfectamente la ingeniería financiera, la gamificación interactiva y los modelos más avanzados de Inteligencia Artificial para crear una solución única en el mercado ecuatoriano:

```
[Comportamiento Responsable y Gamificación] ──> [Mejora del Pulso Score (IA XGBoost)] ──> [Acceso a Mejores Cofres y Más Beneficios] ──> [Mejores Condiciones de Crédito y Mayor Capital] ──> [Crecimiento de Negocios y Cero Usura Informal]
```

Al premiar e incentivar los hábitos financieros saludables a través de mecánicas divertidas (cofres, ruletas, coins), Deuna transforma el proceso de endeudamiento en una experiencia amigable y motivadora. Mientras los usuarios juegan, ahorran e impulsan sus negocios mediante cobros QR, alimentan con datos valiosos al motor de Inteligencia Artificial. Esto nos permite predecir flujos de caja, otorgar microcréditos formales a tasas reguladas justas del 28% nominal anual, y erradicar el peligroso e informal flagelo del "chulco" en el Ecuador.
