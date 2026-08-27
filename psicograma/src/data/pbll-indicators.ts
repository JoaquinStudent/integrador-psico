export interface PbllIndicator {
  code: string
  category: string
  section: string
  title: string
  interpretation: string
  detection: 'auto' | 'semi' | 'manual'
}

// ponytail: ~201 indicators extracted from Test/Manual_del_Test_Persona_bajo_la_lluvia.md
// detection: auto = measurable from stroke data, semi = stroke data assists, manual = visual/clinical judgment
export const PBLL_INDICATORS: PbllIndicator[] = [
  // =========================================================================
  // A-1) Dimensiones (DIM-*)
  // =========================================================================
  { code: 'DIM-01', category: 'Dimensiones', section: 'A-1', title: 'Dibujo pequeno', interpretation: 'Timidez, aplastamiento, autodesvalorizacion, inseguridades, temores. Retraimiento, sentimiento de inadecuacion, inferioridad, dependiente. Inhibicion, inadecuada percepcion de si mismo.', detection: 'auto' },
  { code: 'DIM-02', category: 'Dimensiones', section: 'A-1', title: 'Dibujo grande', interpretation: 'Necesidad de mostrarse, de ser reconocido. Autoexpansivo. Indice de agresividad. Teatralidad. Si es poco flexible, falta de adaptacion.', detection: 'auto' },
  { code: 'DIM-03', category: 'Dimensiones', section: 'A-1', title: 'Dibujo muy grande', interpretation: 'Controles internos deficientes. Autoreaseguramiento. Inadecuada percepcion de si mismo. Ilusiones paranoides de grandiosidad. Megalomanía.', detection: 'auto' },
  { code: 'DIM-04', category: 'Dimensiones', section: 'A-1', title: 'Dibujo mediano', interpretation: 'Persona bien ubicada en el espacio.', detection: 'auto' },

  // =========================================================================
  // A-2) Emplazamiento (UBI-*)
  // =========================================================================
  { code: 'UBI-01', category: 'Emplazamiento', section: 'A-2', title: 'Margen derecho', interpretation: 'Representa el futuro, lo consciente, el padre o la autoridad. Extravertido. Actividad, empuje, ambicion, optimismo. Confianza en el futuro.', detection: 'auto' },
  { code: 'UBI-02', category: 'Emplazamiento', section: 'A-2', title: 'Margen izquierdo', interpretation: 'Representa el pasado, lo inconsciente y preconsciente. Introversion, pesimismo, debilidad, depresion, fatiga.', detection: 'auto' },
  { code: 'UBI-03', category: 'Emplazamiento', section: 'A-2', title: 'Margen superior', interpretation: 'Rasgos de personalidad euforica, alegre, noble, espiritual, idealista. Tocando el margen: defensas pobres, comportamientos maniacos, rasgos psicoticos.', detection: 'auto' },
  { code: 'UBI-04', category: 'Emplazamiento', section: 'A-2', title: 'Margen inferior', interpretation: 'Rasgos apegados a lo concreto, fuerte tendencia instintiva, falta de imaginacion. En el borde: perdida de contacto con la realidad, hundimiento, depresion.', detection: 'auto' },
  { code: 'UBI-05', category: 'Emplazamiento', section: 'A-2', title: 'Centro de la hoja', interpretation: 'Criterio ajustado a la realidad. Equilibrio entre introversion y extroversion. Objetividad, control de si mismo, reflexion.', detection: 'auto' },

  // =========================================================================
  // A-3) Trazos (TRZ-*)
  // =========================================================================
  { code: 'TRZ-01', category: 'Trazos', section: 'A-3', title: 'Linea armonica, entera, firme', interpretation: 'Persona sana.', detection: 'semi' },
  { code: 'TRZ-02', category: 'Trazos', section: 'A-3', title: 'Linea entrecortada', interpretation: 'Ansiedad, inseguridad. Problemas respiratorios, fatiga, estres. Necesidad de detenerse a analizar. Desintegracion.', detection: 'semi' },
  { code: 'TRZ-03', category: 'Trazos', section: 'A-3', title: 'Linea redondeada o curva', interpretation: 'Rasgos femeninos. Sentido estetico. Dependencia. Espiritu maternal, femineidad. Conciliador, diplomatico.', detection: 'semi' },
  { code: 'TRZ-04', category: 'Trazos', section: 'A-3', title: 'Lineas tirantes', interpretation: 'Tension.', detection: 'semi' },
  { code: 'TRZ-05', category: 'Trazos', section: 'A-3', title: 'Lineas fragmentadas o esbozadas', interpretation: 'Ansiedad, timidez, falta de confianza en si mismo. En algunos casos enfermedad organica.', detection: 'semi' },
  { code: 'TRZ-06', category: 'Trazos', section: 'A-3', title: 'Lineas desconectadas', interpretation: 'No tienen direccion intencional. Tendencias psicoticas. Dispersion del pensamiento.', detection: 'semi' },
  { code: 'TRZ-07', category: 'Trazos', section: 'A-3', title: 'Linea recta', interpretation: 'Fuerza, vitalidad, razonador, frialdad, logica, capacidad de analisis.', detection: 'semi' },
  { code: 'TRZ-08', category: 'Trazos', section: 'A-3', title: 'Linea recta con ondulaciones', interpretation: 'Tension, ansiedad.', detection: 'semi' },
  { code: 'TRZ-09', category: 'Trazos', section: 'A-3', title: 'Linea recta con temblor', interpretation: 'Cuadro organico, persona de avanzada edad, gran angustia, adictos. Signo de decadencia de funciones.', detection: 'semi' },
  { code: 'TRZ-10', category: 'Trazos', section: 'A-3', title: 'Linea recta definida pero tosca', interpretation: 'Tendencias agresivas.', detection: 'semi' },
  { code: 'TRZ-11', category: 'Trazos', section: 'A-3', title: 'Linea con angulos, ganchos o picos', interpretation: 'Agresividad, impaciencia, vitalidad, independencia. Dureza, tenacidad, obstinacion.', detection: 'semi' },
  { code: 'TRZ-12', category: 'Trazos', section: 'A-3', title: 'Lineas con angulos muy agudos', interpretation: 'Excesiva reaccion emocional, hiperemotivo.', detection: 'semi' },
  { code: 'TRZ-13', category: 'Trazos', section: 'A-3', title: 'Lineas sin control o en zigzag', interpretation: 'Imposibilidad de controlar impulsos. Descontrolado. Rasgos psicopaticos. Agresividad violenta.', detection: 'semi' },
  { code: 'TRZ-14', category: 'Trazos', section: 'A-3', title: 'Lineas pegadas al papel formando puntas', interpretation: 'Rasgo epileptoide.', detection: 'semi' },
  { code: 'TRZ-15', category: 'Trazos', section: 'A-3', title: 'Lineas circulares con adornos', interpretation: 'Narcisismo.', detection: 'semi' },
  { code: 'TRZ-16', category: 'Trazos', section: 'A-3', title: 'Lineas curvas que se rectangularizan', interpretation: 'No se permiten emociones, bloqueo afectivo, supresion de afectos.', detection: 'semi' },

  // =========================================================================
  // A-4) Presion (PRE-*)
  // =========================================================================
  { code: 'PRE-01', category: 'Presion', section: 'A-4', title: 'Presion normal', interpretation: 'Equilibrado, adaptado, elaborador, constante. Armonioso.', detection: 'auto' },
  { code: 'PRE-02', category: 'Presion', section: 'A-4', title: 'Presion debil con velocidad', interpretation: 'Rapidez mental, originalidad, agilidad, intuicion, hipersensibilidad, creativo, vehemente.', detection: 'auto' },
  { code: 'PRE-03', category: 'Presion', section: 'A-4', title: 'Presion debil con lentitud', interpretation: 'Ansiedad, timidez, ocultamiento, falta de sinceridad, desubicacion, rasgos depresivos.', detection: 'auto' },
  { code: 'PRE-04', category: 'Presion', section: 'A-4', title: 'Presion fuerte pigmentada', interpretation: 'Fuerza fisica, energia vital, seguridad, extraversion, agresion, hostilidad. En personas evolucionadas: lider. En poco evolucionadas: agresividad.', detection: 'auto' },
  { code: 'PRE-05', category: 'Presion', section: 'A-4', title: 'Presion fuerte empastada', interpretation: 'Individuos lentos, sensuales, rutinarios, de poca iniciativa, poco creativos, estaticos.', detection: 'auto' },
  { code: 'PRE-06', category: 'Presion', section: 'A-4', title: 'Presion muy fuerte', interpretation: 'Agresividad.', detection: 'auto' },

  // =========================================================================
  // A-5) Tiempo (TMP-*)
  // =========================================================================
  { code: 'TMP-01', category: 'Tiempo', section: 'A-5', title: 'Dificultad para comenzar', interpretation: 'Verbalizaciones previas, excusas, disculpas. Dificultad para enfrentar una tarea nueva, para tomar decisiones.', detection: 'auto' },
  { code: 'TMP-02', category: 'Tiempo', section: 'A-5', title: 'Dificultad para concluir', interpretation: 'Agregado de detalles, preguntas superfluas. Dificultad para separarse del otro, caracter epileptoide.', detection: 'auto' },
  { code: 'TMP-03', category: 'Tiempo', section: 'A-5', title: 'Momentos de quietud', interpretation: 'Se detiene en la ejecucion para continuarlo luego. Lagunas, bloqueos.', detection: 'auto' },
  { code: 'TMP-04', category: 'Tiempo', section: 'A-5', title: 'Velocidad normal', interpretation: 'Dibujo espontaneo y continuo.', detection: 'auto' },
  { code: 'TMP-05', category: 'Tiempo', section: 'A-5', title: 'Ejecucion lenta y continua', interpretation: 'Pobreza intelectual, falta de riqueza imaginativa.', detection: 'auto' },
  { code: 'TMP-06', category: 'Tiempo', section: 'A-5', title: 'Ejecucion rapida', interpretation: 'Agilidad, excitabilidad.', detection: 'auto' },
  { code: 'TMP-07', category: 'Tiempo', section: 'A-5', title: 'Ejecucion precipitada', interpretation: 'Generalmente descuidada o inconclusa. Atropello, hipersensibilidad o necesidad de liberarse rapidamente de los problemas.', detection: 'auto' },

  // =========================================================================
  // A-6) Secuencia (SEC-*)
  // =========================================================================
  { code: 'SEC-01', category: 'Secuencia', section: 'A-6', title: 'Inicio por cabeza, cuerpo, paraguas, lluvia', interpretation: 'Lo esperable. Secuencia normal.', detection: 'semi' },
  { code: 'SEC-02', category: 'Secuencia', section: 'A-6', title: 'Inicio por los pies', interpretation: 'Perturbacion del pensamiento, no toma el camino adecuado para la resolucion del problema.', detection: 'semi' },
  { code: 'SEC-03', category: 'Secuencia', section: 'A-6', title: 'Inicio por el paraguas', interpretation: 'Excesiva defensa y control.', detection: 'semi' },

  // =========================================================================
  // A-7) Movimiento (MOV-*)
  // =========================================================================
  { code: 'MOV-01', category: 'Movimiento', section: 'A-7', title: 'Rigidez', interpretation: 'Sujeto encerrado y protegido del mundo. Despersonalizado. Se siente amenazado. No adaptado, no tiene libertad para actuar.', detection: 'manual' },
  { code: 'MOV-02', category: 'Movimiento', section: 'A-7', title: 'Mucha actividad en el dibujo', interpretation: 'Exceso de fantasia, actitud maniaca.', detection: 'manual' },
  { code: 'MOV-03', category: 'Movimiento', section: 'A-7', title: 'En posicion de caminar', interpretation: 'Se interpreta segun hacia donde se dirige.', detection: 'manual' },
  { code: 'MOV-04', category: 'Movimiento', section: 'A-7', title: 'Realizando una accion concreta', interpretation: 'Energetico. Actitud euforica.', detection: 'manual' },
  { code: 'MOV-05', category: 'Movimiento', section: 'A-7', title: 'Exhibiendose', interpretation: 'Narcisismo.', detection: 'manual' },

  // =========================================================================
  // A-8) Sombreados (SOM-*)
  // =========================================================================
  { code: 'SOM-01', category: 'Sombreados', section: 'A-8', title: 'Sombreados', interpretation: 'Ansiedad por el cuerpo segun la zona que senalen. Necesidad de controlar esa parte del cuerpo. Mecanismo de defensa: anulacion.', detection: 'semi' },

  // =========================================================================
  // B-1) Orientacion de la persona (ORI-*)
  // =========================================================================
  { code: 'ORI-01', category: 'Orientacion persona', section: 'B-1', title: 'Hacia la derecha', interpretation: 'Comportamiento positivo. Avance hacia el futuro. Necesidad de crecer. Buena relacion con el padre y/o autoridad.', detection: 'manual' },
  { code: 'ORI-02', category: 'Orientacion persona', section: 'B-1', title: 'Hacia la izquierda', interpretation: 'Direccion hacia el pasado. Conflictos sin resolver. Algo del pasado que pesa y frena su evolucion. Conflictos con la madre.', detection: 'manual' },
  { code: 'ORI-03', category: 'Orientacion persona', section: 'B-1', title: 'Hacia el frente', interpretation: 'Dispuesto a enfrentar al mundo. Comportamiento presente.', detection: 'manual' },
  { code: 'ORI-04', category: 'Orientacion persona', section: 'B-1', title: 'Orientacion dubitativa', interpretation: 'Ambivalencia. Tendencias obsesivas o paranoides. Falta de decision. Incoordinacion.', detection: 'manual' },
  { code: 'ORI-05', category: 'Orientacion persona', section: 'B-1', title: 'De perfil', interpretation: 'Persona que no va de frente, que necesita buscar refugio. Evasion.', detection: 'manual' },
  { code: 'ORI-06', category: 'Orientacion persona', section: 'B-1', title: 'De espaldas', interpretation: 'Deseo de no ser controlado socialmente. Afectos e intenciones ocultas. Oposicionistas, introvertidos. Ocultamiento.', detection: 'manual' },
  { code: 'ORI-07', category: 'Orientacion persona', section: 'B-1', title: 'Dibujos muy a la izquierda', interpretation: 'Accion bloqueada. Personalidad esquizoide. Dependencia e idealismo.', detection: 'manual' },
  { code: 'ORI-08', category: 'Orientacion persona', section: 'B-1', title: 'Dibujo muy a la derecha y abajo', interpretation: 'Decepcion, resignacion, depresion. Freno al crecimiento espiritual y psiquico. Hundimiento.', detection: 'manual' },
  { code: 'ORI-09', category: 'Orientacion persona', section: 'B-1', title: 'Persona vista desde arriba', interpretation: 'Toma de distancia del entorno. Sentimientos compensatorios de superioridad. Actitud oposicionista.', detection: 'manual' },
  { code: 'ORI-10', category: 'Orientacion persona', section: 'B-1', title: 'Persona vista desde lejos', interpretation: 'Se sienten rechazadas o desvalorizadas. Sentimientos de inferioridad. Inaccesibles.', detection: 'manual' },
  { code: 'ORI-11', category: 'Orientacion persona', section: 'B-1', title: 'Persona inclinada', interpretation: 'Falta de equilibrio, inestabilidad, persona que se esta trastornando.', detection: 'manual' },
  { code: 'ORI-12', category: 'Orientacion persona', section: 'B-1', title: 'Persona inconclusa', interpretation: 'Desgano, indecision, abulia, depresion.', detection: 'manual' },

  // =========================================================================
  // B-2) Posturas (POS-*)
  // =========================================================================
  { code: 'POS-01', category: 'Posturas', section: 'B-2', title: 'Sentado', interpretation: 'Amante de la tranquilidad, buen negociador, diplomatico. Abatimiento. Puede representar enfermedad fisica. Mecanismos: represion, regresion.', detection: 'manual' },
  { code: 'POS-02', category: 'Posturas', section: 'B-2', title: 'Acostado', interpretation: 'Escasa vitalidad. Desesperanza. En personas con impedimentos fisicos: aceptacion de la limitacion.', detection: 'manual' },
  { code: 'POS-03', category: 'Posturas', section: 'B-2', title: 'Arrodillado', interpretation: 'Sumision, debilidad, esclavitud. Sentimientos de inferioridad. Masoquismo, resignacion.', detection: 'manual' },

  // =========================================================================
  // B-3) Borrados (BOR-*)
  // =========================================================================
  { code: 'BOR-01', category: 'Borrados', section: 'B-3', title: 'Borrado excesivo', interpretation: 'Incertidumbre, autoinsatisfaccion, indecision, ansiedad, descontrol, agresividad, conflicto.', detection: 'auto' },

  // =========================================================================
  // B-5) Detalles accesorios (DET-*)
  // =========================================================================
  { code: 'DET-01', category: 'Detalles accesorios', section: 'B-5', title: 'Escasez de detalles', interpretation: 'Sensacion de vacio, depresion.', detection: 'manual' },
  { code: 'DET-02', category: 'Detalles accesorios', section: 'B-5', title: 'Detalles excesivos', interpretation: 'Sujetos maniacos y obsesivos-compulsivos. Perfeccionismo. Temor a desorganizarse.', detection: 'manual' },
  { code: 'DET-03', category: 'Detalles accesorios', section: 'B-5', title: 'Nubes', interpretation: 'Presion, amenaza. A veces representan figuras parentales. Tendencias autoagresivas o dolencias psicosomaticas.', detection: 'manual' },
  { code: 'DET-04', category: 'Detalles accesorios', section: 'B-5', title: 'Lluvia torrencial', interpretation: 'Mucha presion, situacion muy estresante, agobiante, como que no hay defensa que alcance.', detection: 'manual' },
  { code: 'DET-05', category: 'Detalles accesorios', section: 'B-5', title: 'Lluvia escasa', interpretation: 'Persona que se siente con posibilidades de defenderse frente a las presiones ambientales.', detection: 'manual' },
  { code: 'DET-06', category: 'Detalles accesorios', section: 'B-5', title: 'Gotas como lagrimas', interpretation: 'Angustia.', detection: 'manual' },
  { code: 'DET-07', category: 'Detalles accesorios', section: 'B-5', title: 'Sin lluvia', interpretation: 'Oposicionismo, persona manipuladora. Tendencia a negar las presiones y los conflictos del medio.', detection: 'manual' },
  { code: 'DET-08', category: 'Detalles accesorios', section: 'B-5', title: 'Lluvia en un solo lugar', interpretation: 'Se debe analizar sobre que lugar dibuja la lluvia.', detection: 'manual' },
  { code: 'DET-09', category: 'Detalles accesorios', section: 'B-5', title: 'Rayos', interpretation: 'Presion que sacude al sujeto.', detection: 'manual' },
  { code: 'DET-10', category: 'Detalles accesorios', section: 'B-5', title: 'Charco', interpretation: 'Suele representar sufrimiento fetal y acontecimientos traumaticos ocurridos a la madre embarazada.', detection: 'manual' },
  { code: 'DET-11', category: 'Detalles accesorios', section: 'B-5', title: 'Objetos inanimados y adornos', interpretation: 'Obstaculos. Debe analizarse la ubicacion de los mismos.', detection: 'manual' },
  { code: 'DET-12', category: 'Detalles accesorios', section: 'B-5', title: 'Animales', interpretation: 'Objetos acompanantes, dependencia, necesidad de proteccion, sentimiento de soledad.', detection: 'manual' },
  { code: 'DET-13', category: 'Detalles accesorios', section: 'B-5', title: 'Arboles, plantas, flores', interpretation: 'Aunque generalmente funcionan como obstaculos, hay que detenerse en el analisis.', detection: 'manual' },
  { code: 'DET-14', category: 'Detalles accesorios', section: 'B-5', title: 'Sol y/o luna', interpretation: 'Representan a la autoridad adulta, controladora o de apoyo parental. Fijacion de limites.', detection: 'manual' },
  { code: 'DET-15', category: 'Detalles accesorios', section: 'B-5', title: 'Objetos por debajo de la persona', interpretation: 'Contenido inconsciente movilizado. Dependencia de presiones instintivas.', detection: 'manual' },
  { code: 'DET-16', category: 'Detalles accesorios', section: 'B-5', title: 'Objetos a la derecha de la persona', interpretation: 'Obstaculos que el sujeto mismo se pone para avanzar. Temer o no querer asumir responsabilidades.', detection: 'manual' },
  { code: 'DET-17', category: 'Detalles accesorios', section: 'B-5', title: 'Objetos a la izquierda de la persona', interpretation: 'Hechos o acontecimientos que quedaron sin resolver.', detection: 'manual' },
  { code: 'DET-18', category: 'Detalles accesorios', section: 'B-5', title: 'Objetos por sobre la persona', interpretation: 'Presiones, restricciones, ideales, fantasias, necesidades de proteccion, autoridad, conductas fobicas.', detection: 'manual' },
  { code: 'DET-19', category: 'Detalles accesorios', section: 'B-5', title: 'Dibujo de varias personas', interpretation: 'Necesidad del apoyo de otros para seguir adelante.', detection: 'manual' },
  { code: 'DET-20', category: 'Detalles accesorios', section: 'B-5', title: 'Persona encerrada entre lineas', interpretation: 'Necesidad de ser contenido por el medio ambiente. Poca capacidad para crecer. Bloqueado. A veces rasgos obsesivos.', detection: 'manual' },
  { code: 'DET-21', category: 'Detalles accesorios', section: 'B-5', title: 'Anteojos (en persona que no los usa)', interpretation: 'Ocultamiento, curiosidad sexual, voyeurismo.', detection: 'manual' },
  { code: 'DET-22', category: 'Detalles accesorios', section: 'B-5', title: 'Baston, pipa', interpretation: 'Fantasias sexuales.', detection: 'manual' },

  // =========================================================================
  // B-6) Vestimenta (VES-*)
  // =========================================================================
  { code: 'VES-01', category: 'Vestimenta', section: 'B-6', title: 'Bolsillos', interpretation: 'Organos receptivos. En varones: dependencia materna, conflicto homosexual. En mujeres: comportamiento histerico. Conflicto interior, sexual, culpa.', detection: 'manual' },
  { code: 'VES-02', category: 'Vestimenta', section: 'B-6', title: 'Botones', interpretation: 'Inmadurez, dependencia, caracter obsesivo, preocupacion por lo social, preocupacion somatica. Un solo boton: apego al vinculo materno.', detection: 'manual' },
  { code: 'VES-03', category: 'Vestimenta', section: 'B-6', title: 'Botas', interpretation: 'Sobrecomprension, reafirmacion de la decision.', detection: 'manual' },
  { code: 'VES-04', category: 'Vestimenta', section: 'B-6', title: 'Transparencias', interpretation: 'Angustia frente al cuerpo. A veces dano neurologico, lesion cerebral, intoxicacion, organicidad. Poco criterio. Conducta actuadora.', detection: 'manual' },
  { code: 'VES-05', category: 'Vestimenta', section: 'B-6', title: 'Detalles de ropa sin terminar', interpretation: 'Sentimientos de inadecuacion.', detection: 'manual' },
  { code: 'VES-06', category: 'Vestimenta', section: 'B-6', title: 'Corbatas', interpretation: 'Signo sexual. Debilidad.', detection: 'manual' },
  { code: 'VES-07', category: 'Vestimenta', section: 'B-6', title: 'Zapatos muy marcados', interpretation: 'Conflicto sexual. Con cordones: impulsos sexuales. Frecuente en adolescentes.', detection: 'manual' },
  { code: 'VES-08', category: 'Vestimenta', section: 'B-6', title: 'Zapatos en punta, con tacos', interpretation: 'Agresion.', detection: 'manual' },

  // =========================================================================
  // B-7) Paraguas como defensa (PAR-*)
  // =========================================================================
  { code: 'PAR-01', category: 'Paraguas', section: 'B-7', title: 'Ausencia de paraguas', interpretation: 'Falta de defensas. Con anchos hombros: se defiende con su cuerpo, apechuga, se expone y corre riesgos.', detection: 'manual' },
  { code: 'PAR-02', category: 'Paraguas', section: 'B-7', title: 'Paraguas cubriendo adecuadamente', interpretation: 'Defensas sanas, sentimiento de adecuacion, confianza en si mismo, seguridad. Capacidad de prever.', detection: 'manual' },
  { code: 'PAR-03', category: 'Paraguas', section: 'B-7', title: 'Paraguas cubriendo media cabeza', interpretation: 'Retraimiento, escape, ocultamiento, recorte de la percepcion.', detection: 'manual' },
  { code: 'PAR-04', category: 'Paraguas', section: 'B-7', title: 'Paraguas muy grande', interpretation: 'Excesiva proteccion y defensa. Recortamiento del medio y distancia con el entorno. Poco criterio.', detection: 'manual' },
  { code: 'PAR-05', category: 'Paraguas', section: 'B-7', title: 'Paraguas muy chico', interpretation: 'Defensas labiles. Deja a la persona casi expuesta. Conflicto, perturbacion sexual, dificultades interpersonales.', detection: 'manual' },
  { code: 'PAR-06', category: 'Paraguas', section: 'B-7', title: 'Paraguas cerrado', interpretation: 'Resignacion. Bajar la guardia, dejar que otro lo defienda. Sin fuerzas para luchar.', detection: 'manual' },
  { code: 'PAR-07', category: 'Paraguas', section: 'B-7', title: 'Paraguas cerrado y en el piso', interpretation: 'Poca energia para defenderse. En ocasiones enfermedad terminal.', detection: 'manual' },
  { code: 'PAR-08', category: 'Paraguas', section: 'B-7', title: 'Paraguas hacia la derecha', interpretation: 'Se defiende del ambiente. Temor a lo social. Desconfianza. Defensa por temor al padre y/o autoridad.', detection: 'manual' },
  { code: 'PAR-09', category: 'Paraguas', section: 'B-7', title: 'Paraguas hacia la izquierda', interpretation: 'Se defiende de la figura materna, de los deseos edipicos y las pulsiones infantiles.', detection: 'manual' },
  { code: 'PAR-10', category: 'Paraguas', section: 'B-7', title: 'Paraguas volando', interpretation: 'Defensa labil. Yo muy debil. Preocupaciones.', detection: 'manual' },
  { code: 'PAR-11', category: 'Paraguas', section: 'B-7', title: 'Paraguas y nubes fusionados', interpretation: 'Contaminacion. Indice de esquizofrenia. Ideas confusas.', detection: 'manual' },
  { code: 'PAR-12', category: 'Paraguas', section: 'B-7', title: 'Paraguas con agujeros', interpretation: 'Fabulacion. Psicopatia. Enfermedad organica.', detection: 'manual' },
  { code: 'PAR-13', category: 'Paraguas', section: 'B-7', title: 'Paraguas con dibujos', interpretation: 'En muchos casos personas con enfermedades organicas.', detection: 'manual' },
  { code: 'PAR-14', category: 'Paraguas', section: 'B-7', title: 'Paraguas como sombrero', interpretation: 'Confusion de ideas.', detection: 'manual' },
  { code: 'PAR-15', category: 'Paraguas', section: 'B-7', title: 'Paraguas tipo lanza', interpretation: 'Recurre a la agresion como defensa.', detection: 'manual' },
  { code: 'PAR-16', category: 'Paraguas', section: 'B-7', title: 'Paraguas con varillas remarcadas', interpretation: 'Fabulacion. Crea historias falsas. Se miente.', detection: 'manual' },
  { code: 'PAR-17', category: 'Paraguas', section: 'B-7', title: 'Mango de paraguas remarcado', interpretation: 'Falta de plasticidad. Necesidad de aferrarse a algo aunque sin saber si le sirve como defensa.', detection: 'manual' },
  { code: 'PAR-18', category: 'Paraguas', section: 'B-7', title: 'Mango de paraguas debil', interpretation: 'Defensas pobres, poca fortaleza para sostenerse.', detection: 'manual' },

  // =========================================================================
  // B-9) Partes del cuerpo (CUE-*)
  // =========================================================================
  // Cabeza
  { code: 'CUE-01', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabeza dibujada primero', interpretation: 'Localizacion del yo. Centro de todos los estimulos. Poder intelectual, poder social o dominio.', detection: 'manual' },
  { code: 'CUE-02', category: 'Partes del cuerpo', section: 'B-9', title: 'Dibujo de la cabeza solamente', interpretation: 'Disociacion cuerpo-mente. Se defiende con el pensamiento.', detection: 'manual' },
  { code: 'CUE-03', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabeza grande, desproporcionada', interpretation: 'Deseo de poder, vanidad, narcisismo, autoexigencia, dificultades para el aprendizaje.', detection: 'manual' },
  { code: 'CUE-04', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabeza tronchada', interpretation: 'Limitacion de la capacidad de simbolizar.', detection: 'manual' },
  // Cara
  { code: 'CUE-05', category: 'Partes del cuerpo', section: 'B-9', title: 'Cara sin rasgos', interpretation: 'Desconocimiento de si mismo, problemas de identidad.', detection: 'manual' },
  { code: 'CUE-06', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos sin pupilas', interpretation: 'Inmadurez emocional, egocentrismo. Negacion de si mismo o del mundo. Dependencia materna. Vaciedad.', detection: 'manual' },
  { code: 'CUE-07', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos muy marcados', interpretation: 'Rasgos paranoides.', detection: 'manual' },
  { code: 'CUE-08', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos bizcos', interpretation: 'Rebeldia, hostilidad hacia los demas.', detection: 'manual' },
  { code: 'CUE-09', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos cerrados', interpretation: 'De menor patologia que ojo sin pupila. Narcisismo.', detection: 'manual' },
  { code: 'CUE-10', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos como puntos', interpretation: 'Retraimiento. Inseguridad.', detection: 'manual' },
  { code: 'CUE-11', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos con pestanas', interpretation: 'En hombre: afeminamiento. En mujeres: seduccion.', detection: 'manual' },
  { code: 'CUE-12', category: 'Partes del cuerpo', section: 'B-9', title: 'Ojos en V', interpretation: 'Agresion.', detection: 'manual' },
  // Boca
  { code: 'CUE-13', category: 'Partes del cuerpo', section: 'B-9', title: 'Boca linea recta unica', interpretation: 'Tendencia verbal sadico-agresiva.', detection: 'manual' },
  { code: 'CUE-14', category: 'Partes del cuerpo', section: 'B-9', title: 'Boca linea concava unica', interpretation: 'Pasivo, complaciente.', detection: 'manual' },
  { code: 'CUE-15', category: 'Partes del cuerpo', section: 'B-9', title: 'Boca linea convexa unica', interpretation: 'Amargura.', detection: 'manual' },
  { code: 'CUE-16', category: 'Partes del cuerpo', section: 'B-9', title: 'Boca abierta o rota', interpretation: 'Dificultad de introyecciones adecuadas.', detection: 'manual' },
  { code: 'CUE-17', category: 'Partes del cuerpo', section: 'B-9', title: 'Labios marcados', interpretation: 'Dependencia oral.', detection: 'manual' },
  { code: 'CUE-18', category: 'Partes del cuerpo', section: 'B-9', title: 'Labios pintados', interpretation: 'Caracter femenino.', detection: 'manual' },
  { code: 'CUE-19', category: 'Partes del cuerpo', section: 'B-9', title: 'Dientes', interpretation: 'Agresividad oral. Conflicto sexual.', detection: 'manual' },
  // Otros rasgos faciales
  { code: 'CUE-20', category: 'Partes del cuerpo', section: 'B-9', title: 'Cejas muy marcadas', interpretation: 'Agresividad.', detection: 'manual' },
  { code: 'CUE-21', category: 'Partes del cuerpo', section: 'B-9', title: 'Nariz muy marcada', interpretation: 'Virilidad, simbolo falico. Agujeros en la nariz: agresividad, problemas respiratorios, alucinaciones olfativas.', detection: 'manual' },
  { code: 'CUE-22', category: 'Partes del cuerpo', section: 'B-9', title: 'Orejas', interpretation: 'Preocupacion por criticas y opiniones de otros. Deficiencia en la audicion, alucinaciones auditivas.', detection: 'manual' },
  { code: 'CUE-23', category: 'Partes del cuerpo', section: 'B-9', title: 'Menton', interpretation: 'Energia de caracter.', detection: 'manual' },
  { code: 'CUE-24', category: 'Partes del cuerpo', section: 'B-9', title: 'Menton sombreado', interpretation: 'Tendencia a dominar, a ejercer el poder.', detection: 'manual' },
  { code: 'CUE-25', category: 'Partes del cuerpo', section: 'B-9', title: 'Menton muy sombreado', interpretation: 'Indice de conflicto con el medio.', detection: 'manual' },
  // Cuello
  { code: 'CUE-26', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuello', interpretation: 'Coordina lo que se siente con lo que se piensa. Sensacion de comodidad y confianza.', detection: 'manual' },
  { code: 'CUE-27', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuello angosto', interpretation: 'Depresion.', detection: 'manual' },
  { code: 'CUE-28', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuello grueso', interpretation: 'Sentimiento de inmovilidad.', detection: 'manual' },
  { code: 'CUE-29', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuello largo', interpretation: 'Arrogancia. Desarmonia entre el intelecto y la emocion. Incoordinacion.', detection: 'manual' },
  { code: 'CUE-30', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuello inmovilizado', interpretation: 'Inhibicion sexual.', detection: 'manual' },
  // Cabello
  { code: 'CUE-31', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabello', interpretation: 'Potencia sexual, vitalidad. Signo de virilidad, apasionamiento y seduccion.', detection: 'manual' },
  { code: 'CUE-32', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabello muy sombreado o sucio', interpretation: 'Regresion anal-expulsiva.', detection: 'manual' },
  { code: 'CUE-33', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabellos en punta', interpretation: 'Agresion.', detection: 'manual' },
  { code: 'CUE-34', category: 'Partes del cuerpo', section: 'B-9', title: 'Cabello con raya al medio', interpretation: 'Identificacion femenina y resolucion del conflicto por medio de mecanismos compulsivos-obsesivos y narcisistas.', detection: 'manual' },
  { code: 'CUE-35', category: 'Partes del cuerpo', section: 'B-9', title: 'Adornos en el cabello', interpretation: 'Indicador de control.', detection: 'manual' },
  // Cuerpo y tronco
  { code: 'CUE-36', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuerpo cuadrado', interpretation: 'Primitivismo, debilidad mental.', detection: 'manual' },
  { code: 'CUE-37', category: 'Partes del cuerpo', section: 'B-9', title: 'Cuerpo estrecho', interpretation: 'Disconforme con su propio cuerpo. Conflicto en el esquema corporal.', detection: 'manual' },
  { code: 'CUE-38', category: 'Partes del cuerpo', section: 'B-9', title: 'Dibujo del cuerpo con palotes', interpretation: 'Signo de evasion. Falta de compromiso. Infantilismo. No darse a conocer.', detection: 'manual' },
  { code: 'CUE-39', category: 'Partes del cuerpo', section: 'B-9', title: 'Omision de tronco', interpretation: 'Necesidad de reprimir o negar impulsos corporales.', detection: 'manual' },
  { code: 'CUE-40', category: 'Partes del cuerpo', section: 'B-9', title: 'Hombros', interpretation: 'Fachada de seguridad, sobrecompensacion de inseguridad o inadaptacion. Caracter dominante, autoritario.', detection: 'manual' },
  { code: 'CUE-41', category: 'Partes del cuerpo', section: 'B-9', title: 'Hombros muy grandes y musculosos', interpretation: 'Ambivalencia sexual.', detection: 'manual' },
  { code: 'CUE-42', category: 'Partes del cuerpo', section: 'B-9', title: 'Caderas', interpretation: 'En la mujer: deseo de maternidad. En el hombre: conflicto homosexual.', detection: 'manual' },
  { code: 'CUE-43', category: 'Partes del cuerpo', section: 'B-9', title: 'Cintura remarcada', interpretation: 'Intento de controlar lo instintivo. Seduccion.', detection: 'manual' },
  { code: 'CUE-44', category: 'Partes del cuerpo', section: 'B-9', title: 'Cintura estrecha', interpretation: 'Restriccion forzada de impulsos. Comun en adolescentes.', detection: 'manual' },
  // Extremidades superiores
  { code: 'CUE-45', category: 'Partes del cuerpo', section: 'B-9', title: 'Asimetria de extremidades', interpretation: 'Impulsividad, coordinacion pobre. Falta de equilibrio.', detection: 'manual' },
  { code: 'CUE-46', category: 'Partes del cuerpo', section: 'B-9', title: 'Brazos largos y fuertes', interpretation: 'Expresion de ambicion. Deseo de incorporar el mundo, de aprisionarlo, de contenerlo.', detection: 'manual' },
  { code: 'CUE-47', category: 'Partes del cuerpo', section: 'B-9', title: 'Brazos ondulantes', interpretation: 'Sujetos con problemas respiratorios.', detection: 'manual' },
  { code: 'CUE-48', category: 'Partes del cuerpo', section: 'B-9', title: 'Sin brazos', interpretation: 'Abandono del mundo objetal. Retraccion de la libido. Puede implicar tendencia al hurto. Esquizofrenicos y depresiones severas.', detection: 'manual' },
  { code: 'CUE-49', category: 'Partes del cuerpo', section: 'B-9', title: 'Brazos pegados al cuerpo', interpretation: 'Dificultad para contactarse. Reservado, retraido. Rigidez, falta de plasticidad. Temor a manifestar impulsos hostiles.', detection: 'manual' },
  // Manos y dedos
  { code: 'CUE-50', category: 'Partes del cuerpo', section: 'B-9', title: 'Manos y dedos', interpretation: 'Manipulacion, contacto con objetos, confianza, agresividad, eficiencia, culpa. Capacidad de tomar el mundo.', detection: 'manual' },
  { code: 'CUE-51', category: 'Partes del cuerpo', section: 'B-9', title: 'Mano dibujada en forma inconclusa', interpretation: 'Sentimiento de culpa.', detection: 'manual' },
  { code: 'CUE-52', category: 'Partes del cuerpo', section: 'B-9', title: 'Manos ocultas', interpretation: 'Evasion de problemas.', detection: 'manual' },
  { code: 'CUE-53', category: 'Partes del cuerpo', section: 'B-9', title: 'Sin manos', interpretation: 'Negacion de dar y/o recibir. Egoismo.', detection: 'manual' },
  { code: 'CUE-54', category: 'Partes del cuerpo', section: 'B-9', title: 'Dibujo de la palma de la mano y dedos', interpretation: 'En adultos: regresion.', detection: 'manual' },
  { code: 'CUE-55', category: 'Partes del cuerpo', section: 'B-9', title: 'Manos enguantadas', interpretation: 'Indicador de control. Frecuente en adolescentes. Disimulo.', detection: 'manual' },
  { code: 'CUE-56', category: 'Partes del cuerpo', section: 'B-9', title: 'Dedos unidos como manoplas', interpretation: 'Torpeza. Falta de sutileza.', detection: 'manual' },
  { code: 'CUE-57', category: 'Partes del cuerpo', section: 'B-9', title: 'Dedos tipo garra', interpretation: 'Forma aguerrida de enfrentar al mundo. Agresion, egocentrismo, posesividad.', detection: 'manual' },
  { code: 'CUE-58', category: 'Partes del cuerpo', section: 'B-9', title: 'Dedos dibujados como lineas rectas', interpretation: 'Agresion por falta de amor.', detection: 'manual' },
  { code: 'CUE-59', category: 'Partes del cuerpo', section: 'B-9', title: 'Puno cerrado', interpretation: 'Fortaleza, agresividad, manera de sostener las defensas. Beligerancia, retraccion.', detection: 'manual' },
  // Extremidades inferiores y pies
  { code: 'CUE-60', category: 'Partes del cuerpo', section: 'B-9', title: 'Sin pies', interpretation: 'Desaliento, abatimiento, falta de ilusion. Tristeza, resignacion. Falta de confianza en si mismo.', detection: 'manual' },
  { code: 'CUE-61', category: 'Partes del cuerpo', section: 'B-9', title: 'Pies pequenos', interpretation: 'Inseguridad de mantenerse en pie, de alcanzar metas.', detection: 'manual' },
  { code: 'CUE-62', category: 'Partes del cuerpo', section: 'B-9', title: 'Desarmonia en los pies', interpretation: 'Conflicto homosexual cuando coincide desarmonia pie izquierdo-brazo izquierdo respecto al lateral derecho.', detection: 'manual' },
  { code: 'CUE-63', category: 'Partes del cuerpo', section: 'B-9', title: 'Pies descalzos', interpretation: 'Deseo de mantenerse infantil. No querer realizar esfuerzos.', detection: 'manual' },
  { code: 'CUE-64', category: 'Partes del cuerpo', section: 'B-9', title: 'Articulaciones visibles', interpretation: 'Sentimiento de desintegracion. Deficiencias organicas en el area correspondiente.', detection: 'manual' },
  { code: 'CUE-65', category: 'Partes del cuerpo', section: 'B-9', title: 'Piernas largas', interpretation: 'Lucha por la autonomia, deseo de independencia.', detection: 'manual' },
  { code: 'CUE-66', category: 'Partes del cuerpo', section: 'B-9', title: 'Piernas rellenas o gruesas', interpretation: 'Sentimiento de inmovilidad.', detection: 'manual' },
  { code: 'CUE-67', category: 'Partes del cuerpo', section: 'B-9', title: 'Doble linea de apoyo debajo de los pies', interpretation: 'Signo de obsesividad. Puede simbolizar acontecimiento ocurrido en la infancia. Exagerada necesidad de apoyo.', detection: 'manual' },
  // Figura general
  { code: 'CUE-68', category: 'Partes del cuerpo', section: 'B-9', title: 'Dibujo alto, esbelto', interpretation: 'Deseo de sobresalir, de mejorar. Orgullo, vanidad, soberbia.', detection: 'manual' },
  { code: 'CUE-69', category: 'Partes del cuerpo', section: 'B-9', title: 'Figura con mucha musculatura', interpretation: 'Narcisismo.', detection: 'manual' },

  // =========================================================================
  // B-10) Identidad sexual (IDX-*)
  // =========================================================================
  { code: 'IDX-01', category: 'Identidad sexual', section: 'B-10', title: 'Figura del sexo contrario', interpretation: 'Dificultades o conflictos en relaciones objetales primarias. En varones: conflicto homosexual. En mujeres: masculinizacion de la figura femenina.', detection: 'manual' },
  { code: 'IDX-02', category: 'Identidad sexual', section: 'B-10', title: 'Figura desnuda', interpretation: 'Exhibicionismo, psicopatia.', detection: 'manual' },
  { code: 'IDX-03', category: 'Identidad sexual', section: 'B-10', title: 'Persona bajo la ducha', interpretation: 'Narcisismo, exhibicionismo. Histeria.', detection: 'manual' },

  // =========================================================================
  // C) Expresiones de conflicto (EXP-*)
  // =========================================================================
  { code: 'EXP-01', category: 'Expresiones de conflicto', section: 'C', title: 'Neurosis fobica', interpretation: 'Encierra el dibujo con otras lineas, persona acompanada de otras figuras, figuras en cuevas.', detection: 'manual' },
  { code: 'EXP-02', category: 'Expresiones de conflicto', section: 'C', title: 'Neurosis histerica', interpretation: 'Figuras de abundante cabello, sexualizadas, elementos para llamar la atencion.', detection: 'manual' },
  { code: 'EXP-03', category: 'Expresiones de conflicto', section: 'C', title: 'Neurosis obsesiva', interpretation: 'Figuras rigidas, perfeccionismo, detallismo. Dibujos ordenados y aburridos. Borrado desmesurado.', detection: 'manual' },
  { code: 'EXP-04', category: 'Expresiones de conflicto', section: 'C', title: 'Depresion', interpretation: 'Figuras inclinadas, incompletas, falta de pies o piernas, figuras sentadas. Poca presion y autoimagen desvalorizada.', detection: 'semi' },
  { code: 'EXP-05', category: 'Expresiones de conflicto', section: 'C', title: 'Melancolia', interpretation: 'Trazos lentos, muy debiles, casi invisibles. Figuras muy pobres. Abatimiento y vacio por perdida del mundo interior.', detection: 'semi' },
  { code: 'EXP-06', category: 'Expresiones de conflicto', section: 'C', title: 'Psicotico', interpretation: 'Desorganizacion de la gestalt, alteraciones de limites, figuras vacias o infladas. Paraguas incorporado a la figura humana.', detection: 'manual' },
  { code: 'EXP-07', category: 'Expresiones de conflicto', section: 'C', title: 'Psicosis maniaco-depresiva', interpretation: 'Depresivo: inhibicion. Maniaco: exaltacion, despliegue de energia, dibujo complicado y florido, generalmente grande.', detection: 'manual' },
  { code: 'EXP-08', category: 'Expresiones de conflicto', section: 'C', title: 'Paranoia', interpretation: 'Dibujos extravagantes, con excesos de adornos y dan idea de grandeza.', detection: 'manual' },
  { code: 'EXP-09', category: 'Expresiones de conflicto', section: 'C', title: 'Enfermedades psicosomaticas', interpretation: 'Brazos cortos, piernas juntas, omision de nariz, cuerpo hinchado. Generalmente aparecen nubes.', detection: 'manual' },
  { code: 'EXP-10', category: 'Expresiones de conflicto', section: 'C', title: 'Epilepsia', interpretation: 'Dibujos con borrones, manchas, desordenados. Sensacion de abandono y cansancio.', detection: 'manual' },
  { code: 'EXP-11', category: 'Expresiones de conflicto', section: 'C', title: 'Alcoholismo', interpretation: 'Dibujos sucios, con trazos recortados, remarcacion de lineas y temblor.', detection: 'semi' },

  // =========================================================================
  // D) Mecanismos de defensa (DEF-*)
  // =========================================================================
  { code: 'DEF-01', category: 'Mecanismos de defensa', section: 'D', title: 'Desplazamiento', interpretation: 'Necesidad de adicionar nuevos objetos u otras figuras. Fondo muy decorado y preocupacion por determinadas zonas.', detection: 'manual' },
  { code: 'DEF-02', category: 'Mecanismos de defensa', section: 'D', title: 'Regresion', interpretation: 'Figuras perdiendo el equilibrio, como en ruinas. Expresion de panico. Figuras sentadas, sin fuerzas. Confusion de trazos.', detection: 'manual' },
  { code: 'DEF-03', category: 'Mecanismos de defensa', section: 'D', title: 'Anulacion', interpretation: 'Personas que necesitan borrar permanentemente o tachar una figura y hacer otra. A veces sombrean los dibujos.', detection: 'semi' },
  { code: 'DEF-04', category: 'Mecanismos de defensa', section: 'D', title: 'Aislamiento', interpretation: 'Dibujos pobres, aislados, desarticulados, frios. A veces recuadrados entre lineas. Figuras paralizadas, tipo munecas.', detection: 'manual' },
  { code: 'DEF-05', category: 'Mecanismos de defensa', section: 'D', title: 'Represion', interpretation: 'Figuras completas, armonicas, no sexualizadas, muy vestidas. Faltan rasgos sexuales secundarios. Dureza en movimientos.', detection: 'manual' },
  { code: 'DEF-06', category: 'Mecanismos de defensa', section: 'D', title: 'Inhibicion', interpretation: 'Figuras pequenas, trazos debiles, falta de partes o zonas corporales. Verbalizan "No se", "No puedo".', detection: 'semi' },
  { code: 'DEF-07', category: 'Mecanismos de defensa', section: 'D', title: 'Defensas maniacas', interpretation: 'Llena el dibujo con detalles innecesarios.', detection: 'manual' },
]

export const INDICATOR_SECTIONS = [
  { code: 'A-1', name: 'Dimensiones', prefix: 'DIM' },
  { code: 'A-2', name: 'Emplazamiento', prefix: 'UBI' },
  { code: 'A-3', name: 'Trazos', prefix: 'TRZ' },
  { code: 'A-4', name: 'Presion', prefix: 'PRE' },
  { code: 'A-5', name: 'Tiempo', prefix: 'TMP' },
  { code: 'A-6', name: 'Secuencia', prefix: 'SEC' },
  { code: 'A-7', name: 'Movimiento', prefix: 'MOV' },
  { code: 'A-8', name: 'Sombreados', prefix: 'SOM' },
  { code: 'B-1', name: 'Orientacion persona', prefix: 'ORI' },
  { code: 'B-2', name: 'Posturas', prefix: 'POS' },
  { code: 'B-3', name: 'Borrados', prefix: 'BOR' },
  { code: 'B-5', name: 'Detalles accesorios', prefix: 'DET' },
  { code: 'B-6', name: 'Vestimenta', prefix: 'VES' },
  { code: 'B-7', name: 'Paraguas', prefix: 'PAR' },
  { code: 'B-9', name: 'Partes del cuerpo', prefix: 'CUE' },
  { code: 'B-10', name: 'Identidad sexual', prefix: 'IDX' },
  { code: 'C', name: 'Expresiones de conflicto', prefix: 'EXP' },
  { code: 'D', name: 'Mecanismos de defensa', prefix: 'DEF' },
] as const

export const INDICATOR_CATEGORIES = [
  { code: 'A', name: 'Recursos expresivos', sections: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5', 'A-6', 'A-7', 'A-8'] },
  { code: 'B', name: 'Analisis de contenido', sections: ['B-1', 'B-2', 'B-3', 'B-5', 'B-6', 'B-7', 'B-9', 'B-10'] },
  { code: 'C', name: 'Expresiones de conflicto', sections: ['C'] },
  { code: 'D', name: 'Mecanismos de defensa', sections: ['D'] },
] as const
