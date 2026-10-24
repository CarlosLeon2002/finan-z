import type { Locale } from '../types'

/** Contenido bilingüe de los tips y las frases. */

export interface LocalizedText {
  es: string
  en: string
}

export const TIP_THEMES = [
  'mindset',
  'habits',
  'budget',
  'saving',
  'debt',
  'investing',
  'income',
  'protection',
  'giving',
] as const

export type TipTheme = (typeof TIP_THEMES)[number]

export interface Tip {
  id: string
  theme: TipTheme
  text: LocalizedText
  /** Libro, charla o institución que inspira la idea (no es una cita textual). */
  source: LocalizedText
}

export interface Quote {
  id: string
  author: string
  text: LocalizedText
}

/**
 * Biblioteca de consejos. La rotación es diaria y determinista: el mismo día
 * muestra siempre la misma idea y no se repite hasta dar la vuelta completa.
 */
export const TIPS: Tip[] = [
  {
    id: 'wait-24h',
    theme: 'habits',
    text: {
      es: 'Antes de comprar algo que no necesitas, espera 24 horas: casi siempre la urgencia desaparece.',
      en: 'Before buying something you don’t need, wait 24 hours: the urge almost always passes.',
    },
    source: {
      es: 'Inspirado en «La psicología del dinero», Morgan Housel',
      en: 'Inspired by “The Psychology of Money,” Morgan Housel',
    },
  },
  {
    id: 'emergency-fund',
    theme: 'protection',
    text: {
      es: 'Tu fondo de emergencia ideal son entre 3 y 6 meses de gastos esenciales, en una cuenta fácil de retirar.',
      en: 'Your ideal emergency fund is 3 to 6 months of essential expenses, in an easy-to-withdraw account.',
    },
    source: {
      es: 'Inspirado en «The Index Card», Helaine Olen y Harold Pollack',
      en: 'Inspired by “The Index Card,” Helaine Olen and Harold Pollack',
    },
  },
  {
    id: 'pay-yourself-first',
    theme: 'saving',
    text: {
      es: 'Págate primero: aparta el ahorro el día del cobro y vive con lo que queda.',
      en: 'Pay yourself first: move savings aside on payday and live on what is left.',
    },
    source: {
      es: 'Inspirado en «El hombre más rico de Babilonia», George S. Clason',
      en: 'Inspired by “The Richest Man in Babylon,” George S. Clason',
    },
  },
  {
    id: 'review-subscriptions',
    theme: 'budget',
    text: {
      es: 'Revisa tus suscripciones cada mes: los cargos silenciosos son el gasto más fácil de cortar.',
      en: 'Review your subscriptions every month: silent charges are the easiest expense to cut.',
    },
    source: {
      es: 'Inspirado en «I Will Teach You to Be Rich», Ramit Sethi',
      en: 'Inspired by “I Will Teach You to Be Rich,” Ramit Sethi',
    },
  },
  {
    id: 'automate',
    theme: 'habits',
    text: {
      es: 'Automatiza todo lo que puedas: lo que no depende de tu fuerza de voluntad se sostiene solo.',
      en: 'Automate whatever you can: what doesn’t depend on willpower sustains itself.',
    },
    source: {
      es: 'Inspirado en «Hábitos atómicos», James Clear',
      en: 'Inspired by “Atomic Habits,” James Clear',
    },
  },
  {
    id: 'track-30-days',
    theme: 'habits',
    text: {
      es: 'Registra tus gastos durante 30 días: ver el número cambia el comportamiento más que cualquier consejo.',
      en: 'Track your spending for 30 days: seeing the number changes behavior more than any tip.',
    },
    source: {
      es: 'Inspirado en «Tu dinero o tu vida», Vicki Robin',
      en: 'Inspired by “Your Money or Your Life,” Vicki Robin',
    },
  },
  {
    id: 'goal-with-date',
    theme: 'saving',
    text: {
      es: 'Una meta sin fecha y sin monto es un deseo. Ponle cifra y calendario.',
      en: 'A goal without an amount and a date is a wish. Put a number and a deadline on it.',
    },
    source: {
      es: 'Inspirado en la práctica de metas SMART aplicada a finanzas personales',
      en: 'Inspired by SMART goal practice applied to personal finance',
    },
  },
  {
    id: 'lifestyle-inflation',
    theme: 'mindset',
    text: {
      es: 'Evita la inflación de estilo de vida: cuando suba tu sueldo, aumenta primero el ahorro.',
      en: 'Avoid lifestyle inflation: when your salary rises, increase savings first.',
    },
    source: {
      es: 'Inspirado en «Los millonarios de al lado», Stanley y Danko',
      en: 'Inspired by “The Millionaire Next Door,” Stanley and Danko',
    },
  },
  {
    id: 'compare-apr',
    theme: 'debt',
    text: {
      es: 'Mira cuánto pagas al año en intereses, no solo la cuota mensual: ahí está el costo real.',
      en: 'Look at how much interest you pay over a year, not just the monthly payment: that’s the real cost.',
    },
    source: {
      es: 'Inspirado en «The Index Card», Helaine Olen y Harold Pollack',
      en: 'Inspired by “The Index Card,” Helaine Olen and Harold Pollack',
    },
  },
  {
    id: 'pay-on-time',
    theme: 'debt',
    text: {
      es: 'Paga siempre a tiempo y al menos el mínimo: los intereses y las multas por mora destruyen un presupuesto.',
      en: 'Always pay on time and at least the minimum: interest and late fees destroy a budget.',
    },
    source: {
      es: 'Inspirado en «The Total Money Makeover», Dave Ramsey',
      en: 'Inspired by “The Total Money Makeover,” Dave Ramsey',
    },
  },
  {
    id: 'separate-accounts',
    theme: 'budget',
    text: {
      es: 'Separa las cuentas: una para gastos y otra para ahorro. Ver dos números evita que se mezclen.',
      en: 'Keep accounts separate: one for spending, one for savings. Two numbers stop them from mixing.',
    },
    source: {
      es: 'Inspirado en «I Will Teach You to Be Rich», Ramit Sethi',
      en: 'Inspired by “I Will Teach You to Be Rich,” Ramit Sethi',
    },
  },
  {
    id: 'compound-interest',
    theme: 'investing',
    text: {
      es: 'Deja que tus intereses generen más intereses: el tiempo importa más que el monto inicial. Empieza aunque sea poco.',
      en: 'Let your interest earn more interest: time matters more than the starting amount. Start even if it’s small.',
    },
    source: {
      es: 'Inspirado en «The Simple Path to Wealth», JL Collins',
      en: 'Inspired by “The Simple Path to Wealth,” JL Collins',
    },
  },
  {
    id: 'debt-before-investing',
    theme: 'debt',
    text: {
      es: 'Antes de invertir, cubre tus deudas de interés alto: ninguna inversión segura rinde como una deuda cara.',
      en: 'Before investing, clear high-interest debt: no safe investment beats an expensive debt.',
    },
    source: {
      es: 'Inspirado en «The Total Money Makeover», Dave Ramsey',
      en: 'Inspired by “The Total Money Makeover,” Dave Ramsey',
    },
  },
  {
    id: 'check-credit',
    theme: 'protection',
    text: {
      es: 'Revisa tu reporte de crédito al menos dos veces al año: los errores detectados a tiempo ahorran dinero.',
      en: 'Check your credit report at least twice a year: errors caught early save money.',
    },
    source: {
      es: 'Recomendación de la Oficina de Protección Financiera del Consumidor (CFPB)',
      en: 'Recommendation from the Consumer Financial Protection Bureau (CFPB)',
    },
  },
  {
    id: 'budget-for-fun',
    theme: 'budget',
    text: {
      es: 'Presupuesta también los gustos: un presupuesto sin ocio dura muy poco.',
      en: 'Budget for fun too: a budget with no joy never lasts.',
    },
    source: {
      es: 'Inspirado en «You Need a Budget», Jesse Mecham',
      en: 'Inspired by “You Need a Budget,” Jesse Mecham',
    },
  },
  {
    id: 'windfalls',
    theme: 'saving',
    text: {
      es: 'Con un bono o dinero inesperado, usa al menos la mitad para ahorrar o pagar deuda antes de gastarlo.',
      en: 'With a bonus or windfall, use at least half to save or repay debt before spending it.',
    },
    source: {
      es: 'Inspirado en «La psicología del dinero», Morgan Housel',
      en: 'Inspired by “The Psychology of Money,” Morgan Housel',
    },
  },
  {
    id: 'diversify',
    theme: 'investing',
    text: {
      es: 'No pongas todo en un mismo lugar: ni en una sola inversión, ni en un solo banco, ni en una sola idea.',
      en: 'Don’t put everything in one place: not one investment, one bank or one idea.',
    },
    source: {
      es: 'Inspirado en «Un paseo aleatorio por Wall Street», Burton Malkiel',
      en: 'Inspired by “A Random Walk Down Wall Street,” Burton Malkiel',
    },
  },
  {
    id: 'earn-more',
    theme: 'income',
    text: {
      es: 'Invierte en aprender un oficio o herramienta que aumente tus ingresos: el mejor ahorro es ganar más.',
      en: 'Invest in learning a skill that raises your income: the best saving is earning more.',
    },
    source: {
      es: 'Inspirado en «I Will Teach You to Be Rich», Ramit Sethi',
      en: 'Inspired by “I Will Teach You to Be Rich,” Ramit Sethi',
    },
  },
  {
    id: 'conscious-spending',
    theme: 'mindset',
    text: {
      es: 'Gasta sin culpa en lo que de verdad amas y recorta sin piedad en lo que no: el presupuesto es una elección.',
      en: 'Spend guilt-free on what you truly love and cut ruthlessly what you don’t: a budget is a choice.',
    },
    source: {
      es: 'Inspirado en el «gasto consciente» de Ramit Sethi',
      en: 'Inspired by Ramit Sethi’s “conscious spending”',
    },
  },
  {
    id: 'one-percent',
    theme: 'habits',
    text: {
      es: 'Mejora un 1 % cada mes: ajustar un gasto pequeño hoy vale más que esperar al gran cambio.',
      en: 'Get 1% better each month: adjusting one small expense today beats waiting for a big change.',
    },
    source: {
      es: 'Inspirado en «Hábitos atómicos», James Clear',
      en: 'Inspired by “Atomic Habits,” James Clear',
    },
  },
  {
    id: 'money-story',
    theme: 'mindset',
    text: {
      es: 'Tu historia con el dinero importa: identificar si vienes de la escasez o del exceso explica muchas decisiones.',
      en: 'Your money story matters: knowing whether you come from scarcity or excess explains many decisions.',
    },
    source: {
      es: 'Inspirado en «La psicología del dinero», Morgan Housel',
      en: 'Inspired by “The Psychology of Money,” Morgan Housel',
    },
  },
  {
    id: 'enough',
    theme: 'mindset',
    text: {
      es: 'Define qué es «suficiente». Sin una cifra clara, ninguna cantidad de dinero se sentirá bastante.',
      en: 'Define what “enough” means. Without a clear number, no amount of money will ever feel like enough.',
    },
    source: {
      es: 'Inspirado en «La psicología del dinero», Morgan Housel',
      en: 'Inspired by “The Psychology of Money,” Morgan Housel',
    },
  },
  {
    id: 'sinking-funds',
    theme: 'saving',
    text: {
      es: 'Crea fondos para gastos previsibles —seguro, regalos, mantenimiento— y deja de romper el presupuesto cada año.',
      en: 'Create funds for predictable expenses—insurance, gifts, maintenance—and stop breaking your budget every year.',
    },
    source: {
      es: 'Inspirado en las reservas para gastos futuros de YNAB',
      en: 'Inspired by YNAB’s savings categories for future expenses',
    },
  },
  {
    id: 'pay-in-cash',
    theme: 'budget',
    text: {
      es: 'Si no puedes pagarlo en efectivo o con saldo disponible, espera: el crédito no debería financiar caprichos.',
      en: 'If you can’t pay cash or with available balance, wait: credit shouldn’t fund whims.',
    },
    source: {
      es: 'Inspirado en «The Total Money Makeover», Dave Ramsey',
      en: 'Inspired by “The Total Money Makeover,” Dave Ramsey',
    },
  },
  {
    id: 'negotiate-bills',
    theme: 'income',
    text: {
      es: 'Una llamada puede valer más que un mes de recortes: revisa tarifas de internet, telefonía y seguros cada año.',
      en: 'One call can be worth a month of cuts: review internet, phone and insurance rates every year.',
    },
    source: {
      es: 'Inspirado en las tácticas de Ramit Sethi para reducir gastos fijos',
      en: 'Inspired by Ramit Sethi’s tactics for cutting fixed costs',
    },
  },
  {
    id: 'emergency-first',
    theme: 'protection',
    text: {
      es: 'Antes de la meta grande, junta un mini colchón de un mes: evita volver a la tarjeta ante cualquier imprevisto.',
      en: 'Before the big goal, build a one-month mini cushion: it keeps you off the card when something unexpected happens.',
    },
    source: {
      es: 'Inspirado en «The Total Money Makeover», Dave Ramsey',
      en: 'Inspired by “The Total Money Makeover,” Dave Ramsey',
    },
  },
  {
    id: 'index-funds',
    theme: 'investing',
    text: {
      es: 'Para la mayoría, una inversión amplia y de bajo costo supera a intentar adivinar el próximo gran éxito.',
      en: 'For most people, a broad, low-cost investment beats trying to guess the next big winner.',
    },
    source: {
      es: 'Inspirado en «El pequeño libro para invertir con sentido común», John Bogle',
      en: 'Inspired by “The Little Book of Common Sense Investing,” John Bogle',
    },
  },
  {
    id: 'fees-matter',
    theme: 'investing',
    text: {
      es: 'Una comisión de 2 % parece pequeña, pero se lleva una parte enorme de lo que ganas en 30 años.',
      en: 'A 2% fee looks small, but it takes a huge share of what you earn over 30 years.',
    },
    source: {
      es: 'Inspirado en «El pequeño libro para invertir con sentido común», John Bogle',
      en: 'Inspired by “The Little Book of Common Sense Investing,” John Bogle',
    },
  },
  {
    id: 'time-in-market',
    theme: 'investing',
    text: {
      es: 'El tiempo en el mercado suele importar más que acertar el momento: las caídas también forman parte del plan.',
      en: 'Time in the market usually matters more than timing it: downturns are part of the plan too.',
    },
    source: {
      es: 'Inspirado en «Un paseo aleatorio por Wall Street», Burton Malkiel',
      en: 'Inspired by “A Random Walk Down Wall Street,” Burton Malkiel',
    },
  },
  {
    id: 'automate-investing',
    theme: 'investing',
    text: {
      es: 'Programa la inversión el mismo día del cobro: invertir en automático vence a esperar «el mejor momento».',
      en: 'Schedule investing on payday: automatic investing beats waiting for “the right moment.”',
    },
    source: {
      es: 'Inspirado en «The Simple Path to Wealth», JL Collins',
      en: 'Inspired by “The Simple Path to Wealth,” JL Collins',
    },
  },
  {
    id: 'avoid-hot-tips',
    theme: 'investing',
    text: {
      es: 'Desconfía de la oportunidad que no puede esperar: la prisa es la mejor amiga de las malas decisiones.',
      en: 'Be wary of the opportunity that can’t wait: urgency is the best friend of bad decisions.',
    },
    source: {
      es: 'Inspirado en «La psicología del dinero», Morgan Housel',
      en: 'Inspired by “The Psychology of Money,” Morgan Housel',
    },
  },
  {
    id: 'insured',
    theme: 'protection',
    text: {
      es: 'Asegura lo que no podrías reemplazar: salud, vivienda y responsabilidad civil antes que productos con inversión.',
      en: 'Insure what you couldn’t replace: health, home and liability before investment-linked products.',
    },
    source: {
      es: 'Inspirado en «The Index Card», Helaine Olen y Harold Pollack',
      en: 'Inspired by “The Index Card,” Helaine Olen and Harold Pollack',
    },
  },
  {
    id: 'annual-review',
    theme: 'habits',
    text: {
      es: 'Haz una revisión anual de tu dinero: ingresos, gastos, deudas y metas. Una hora puede cambiar el año siguiente.',
      en: 'Do a yearly money review: income, expenses, debt and goals. One hour can change the next year.',
    },
    source: {
      es: 'Inspirado en el ejercicio de «Tu dinero o tu vida», Vicki Robin',
      en: 'Inspired by the exercise in “Your Money or Your Life,” Vicki Robin',
    },
  },
  {
    id: 'give-first',
    theme: 'giving',
    text: {
      es: 'Reserva una parte para dar o ayudar: la generosidad con intención también ordena el resto del presupuesto.',
      en: 'Set aside a share to give or help: intentional generosity also brings order to the rest of the budget.',
    },
    source: {
      es: 'Inspirado en «El hombre más rico de Babilonia», George S. Clason',
      en: 'Inspired by “The Richest Man in Babylon,” George S. Clason',
    },
  },
  {
    id: 'small-leaks',
    theme: 'budget',
    text: {
      es: 'Los gastos pequeños y repetidos hunden más presupuestos que una compra grande: revisa cafés, apps y delivery.',
      en: 'Small repeated expenses sink more budgets than one big purchase: check coffees, apps and delivery.',
    },
    source: {
      es: 'Inspirado en «El camino a la riqueza», Benjamin Franklin',
      en: 'Inspired by “The Way to Wealth,” Benjamin Franklin',
    },
  },
  {
    id: 'cash-flow-calendar',
    theme: 'budget',
    text: {
      es: 'Dibuja tu mes por fechas de cobro y de pago: saber qué días tendrás dinero evita sustos y recargos.',
      en: 'Map your month by paydays and due dates: knowing which days you’ll have money prevents scares and late fees.',
    },
    source: {
      es: 'Inspirado en «The Index Card», Helaine Olen y Harold Pollack',
      en: 'Inspired by “The Index Card,” Helaine Olen and Harold Pollack',
    },
  },
  {
    id: 'no-spend-day',
    theme: 'habits',
    text: {
      es: 'Prueba un día sin gastos esta semana: no se trata de privarte, sino de notar cuánto compras por inercia.',
      en: 'Try one no-spend day this week: it’s not about deprivation, but noticing how much you buy on autopilot.',
    },
    source: {
      es: 'Inspirado en «Hábitos atómicos», James Clear',
      en: 'Inspired by “Atomic Habits,” James Clear',
    },
  },
  {
    id: 'visual-goal',
    theme: 'habits',
    text: {
      es: 'Haz visible tu meta: una imagen o un número a la vista mantiene el ahorro presente cuando llega la tentación.',
      en: 'Make your goal visible: a picture or a number in sight keeps saving present when temptation arrives.',
    },
    source: {
      es: 'Inspirado en «Hábitos atómicos», James Clear',
      en: 'Inspired by “Atomic Habits,” James Clear',
    },
  },
  {
    id: 'ask-for-raise',
    theme: 'income',
    text: {
      es: 'Prepara datos antes de pedir un aumento: lo que aportas vale más que lo que necesitas.',
      en: 'Prepare evidence before asking for a raise: what you contribute matters more than what you need.',
    },
    source: {
      es: 'Inspirado en «I Will Teach You to Be Rich», Ramit Sethi',
      en: 'Inspired by “I Will Teach You to Be Rich,” Ramit Sethi',
    },
  },
  {
    id: 'protect-cushion',
    theme: 'protection',
    text: {
      es: 'No inviertas el fondo de emergencia: su función es estar disponible el día que todo sale mal.',
      en: 'Don’t invest your emergency fund: its job is to be available the day everything goes wrong.',
    },
    source: {
      es: 'Inspirado en «The Index Card», Helaine Olen y Harold Pollack',
      en: 'Inspired by “The Index Card,” Helaine Olen and Harold Pollack',
    },
  },
  {
    id: 'debt-snowball',
    theme: 'debt',
    text: {
      es: 'Si necesitas impulso, paga primero la deuda más pequeña: la victoria rápida te mantiene en el plan.',
      en: 'If you need momentum, pay the smallest debt first: a quick win keeps you on the plan.',
    },
    source: {
      es: 'Inspirado en la «bola de nieve» de «The Total Money Makeover», Dave Ramsey',
      en: 'Inspired by the “debt snowball” in “The Total Money Makeover,” Dave Ramsey',
    },
  },
  {
    id: 'sleep-on-it',
    theme: 'habits',
    text: {
      es: 'Las decisiones financieras importantes se duermen: una noche de distancia filtra casi todas las malas ideas.',
      en: 'Big financial decisions should sleep on it: one night’s distance filters out almost every bad idea.',
    },
    source: {
      es: 'Inspirado en «La psicología del dinero», Morgan Housel',
      en: 'Inspired by “The Psychology of Money,” Morgan Housel',
    },
  },
  {
    id: 'value-vs-price',
    theme: 'investing',
    text: {
      es: 'El precio es lo que pagas; el valor es lo que recibes. Aplícalo a compras, cursos y también a inversiones.',
      en: 'Price is what you pay; value is what you get. Apply it to purchases, courses and investments too.',
    },
    source: {
      es: 'Inspirado en Warren Buffett y «La psicología del dinero»',
      en: 'Inspired by Warren Buffett and “The Psychology of Money”',
    },
  },
]

export const QUOTES: Quote[] = [
  {
    id: 'buffett-rules',
    author: 'Warren Buffett',
    text: {
      es: 'Regla número 1: nunca pierdas dinero. Regla número 2: nunca olvides la regla número 1.',
      en: 'Rule No. 1: never lose money. Rule No. 2: never forget rule No. 1.',
    },
  },
  {
    id: 'franklin-penny',
    author: 'Benjamin Franklin',
    text: {
      es: 'Un centavo ahorrado es un centavo ganado.',
      en: 'A penny saved is a penny earned.',
    },
  },
  {
    id: 'franklin-leak',
    author: 'Benjamin Franklin',
    text: {
      es: 'Cuidado con los gastos pequeños: una pequeña fuga hunde un gran barco.',
      en: 'Beware of little expenses; a small leak will sink a great ship.',
    },
  },
  {
    id: 'morgan-master',
    author: 'J. P. Morgan',
    text: {
      es: 'El dinero es un pésimo amo, pero un excelente servidor.',
      en: 'Money is a terrible master but an excellent servant.',
    },
  },
  {
    id: 'clason-part',
    author: 'George S. Clason',
    text: {
      es: 'Una parte de todo lo que ganes es tuya para conservar.',
      en: 'A part of all you earn is yours to keep.',
    },
  },
  {
    id: 'lynch-know',
    author: 'Peter Lynch',
    text: {
      es: 'Sabe qué posees y por qué lo posees.',
      en: 'Know what you own, and know why you own it.',
    },
  },
  {
    id: 'graham-enemy',
    author: 'Benjamin Graham',
    text: {
      es: 'El mayor problema del inversor —y su peor enemigo— probablemente sea él mismo.',
      en: 'The investor’s chief problem—and even his worst enemy—is likely to be himself.',
    },
  },
  {
    id: 'buffett-price',
    author: 'Warren Buffett',
    text: {
      es: 'El precio es lo que pagas; el valor es lo que obtienes.',
      en: 'Price is what you pay. Value is what you get.',
    },
  },
  {
    id: 'munger-waiting',
    author: 'Charlie Munger',
    text: {
      es: 'El dinero grande no está en comprar o vender, sino en esperar.',
      en: 'The big money is not in the buying and selling, but in the waiting.',
    },
  },
  {
    id: 'ramsey-budget',
    author: 'Dave Ramsey',
    text: {
      es: 'Un presupuesto le dice a tu dinero adónde ir en lugar de preguntarte adónde se fue.',
      en: 'A budget is telling your money where to go instead of wondering where it went.',
    },
  },
  {
    id: 'lincoln-spend',
    author: 'Abraham Lincoln',
    text: {
      es: 'Nunca gastes tu dinero antes de tenerlo.',
      en: 'Never spend your money before you have it.',
    },
  },
  {
    id: 'buffett-tree',
    author: 'Warren Buffett',
    text: {
      es: 'Alguien está sentado a la sombra hoy porque alguien plantó un árbol hace mucho tiempo.',
      en: 'Someone is sitting in the shade today because someone planted a tree a long time ago.',
    },
  },
  {
    id: 'kiyosaki-keep',
    author: 'Robert Kiyosaki',
    text: {
      es: 'No importa cuánto ganes, sino cuánto conservas.',
      en: 'It’s not how much money you make, but how much you keep.',
    },
  },
  {
    id: 'buffett-patient',
    author: 'Warren Buffett',
    text: {
      es: 'La bolsa es un dispositivo que transfiere dinero de los impacientes a los pacientes.',
      en: 'The stock market is a device for transferring money from the impatient to the patient.',
    },
  },
  {
    id: 'buffett-save-first',
    author: 'Warren Buffett',
    text: {
      es: 'No ahorres lo que queda después de gastar; gasta lo que queda después de ahorrar.',
      en: 'Do not save what is left after spending; instead spend what is left after saving.',
    },
  },
  {
    id: 'rogers-spend',
    author: 'Will Rogers',
    text: {
      es: 'Demasiada gente gasta dinero que no ha ganado para comprar cosas que no quiere impresionar a gente que no le importa.',
      en: 'Too many people spend money they haven’t earned to buy things they don’t want to impress people they don’t like.',
    },
  },
  {
    id: 'dickens-balance',
    author: 'Charles Dickens',
    text: {
      es: 'Ingreso anual veinte libras, gasto anual diecinueve con seis: resultado, felicidad.',
      en: 'Annual income twenty pounds, annual expenditure nineteen six, result happiness.',
    },
  },
  {
    id: 'buffett-yourself',
    author: 'Warren Buffett',
    text: {
      es: 'La mejor inversión que puedes hacer es en ti mismo.',
      en: 'The best investment you can make is in yourself.',
    },
  },
  {
    id: 'ramsey-peace',
    author: 'Dave Ramsey',
    text: {
      es: 'La paz financiera no es adquirir cosas, sino aprender a vivir con menos de lo que ganas.',
      en: 'Financial peace isn’t the acquisition of stuff. It’s learning to live on less than you make.',
    },
  },
  {
    id: 'thoreau-wealth',
    author: 'Henry David Thoreau',
    text: {
      es: 'La riqueza es la capacidad de vivir plenamente.',
      en: 'Wealth is the ability to fully experience life.',
    },
  },
  {
    id: 'munger-saving',
    author: 'T. T. Munger',
    text: {
      es: 'El hábito de ahorrar es en sí mismo una educación.',
      en: 'The habit of saving is itself an education.',
    },
  },
  {
    id: 'buffett-sell',
    author: 'Warren Buffett',
    text: {
      es: 'Si compras cosas que no necesitas, pronto tendrás que vender cosas que necesitas.',
      en: 'If you buy things you do not need, soon you will have to sell things you need.',
    },
  },
]

/** Devuelve la versión del idioma activo. */
export function pickText(text: LocalizedText, locale: Locale): string {
  return locale === 'en-US' ? text.en : text.es
}

/** Número de día absoluto en horario local, estable ante cambios de año. */
function dayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  )
}

/** Rotación diaria determinista: el mismo día muestra lo mismo siempre. */
export function tipOfTheDay(date: Date = new Date()): Tip {
  return TIPS[dayNumber(date) % TIPS.length]
}

export function quoteOfTheDay(date: Date = new Date()): Quote {
  // El desfase evita que una frase concreta quede siempre pegada al mismo tip.
  return QUOTES[(dayNumber(date) + 7) % QUOTES.length]
}
