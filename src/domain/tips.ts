import type { Locale } from '../types'

/** Contenido bilingüe de los tips y las frases. */

export interface LocalizedText {
  es: string
  en: string
}

export interface Tip {
  id: string
  text: LocalizedText
}

export interface Quote {
  id: string
  author: string
  text: LocalizedText
}

export const TIPS: Tip[] = [
  {
    id: 'wait-24h',
    text: {
      es: 'Antes de comprar algo que no necesitas, espera 24 horas: casi siempre la urgencia desaparece.',
      en: 'Before buying something you don’t need, wait 24 hours: the urge almost always passes.',
    },
  },
  {
    id: 'emergency-fund',
    text: {
      es: 'Tu fondo de emergencia ideal son entre 3 y 6 meses de gastos esenciales, en una cuenta fácil de retirar.',
      en: 'Your ideal emergency fund is 3 to 6 months of essential expenses, in an easy-to-withdraw account.',
    },
  },
  {
    id: 'pay-yourself-first',
    text: {
      es: 'Págate primero: aparta el ahorro el día del cobro y vive con lo que queda.',
      en: 'Pay yourself first: move savings aside on payday and live on what is left.',
    },
  },
  {
    id: 'review-subscriptions',
    text: {
      es: 'Revisa tus suscripciones cada mes: los cargos silenciosos son el gasto más fácil de cortar.',
      en: 'Review your subscriptions every month: silent charges are the easiest expense to cut.',
    },
  },
  {
    id: 'automate',
    text: {
      es: 'Automatiza todo lo que puedas: lo que no depende de tu fuerza de voluntad se sostiene solo.',
      en: 'Automate whatever you can: what doesn’t depend on willpower sustains itself.',
    },
  },
  {
    id: 'track-30-days',
    text: {
      es: 'Registra tus gastos durante 30 días: ver el número cambia el comportamiento más que cualquier consejo.',
      en: 'Track your spending for 30 days: seeing the number changes behavior more than any tip.',
    },
  },
  {
    id: 'goal-with-date',
    text: {
      es: 'Una meta sin fecha y sin monto es un deseo. Púntale cifra y calendario.',
      en: 'A goal without an amount and a date is a wish. Put a number and a deadline on it.',
    },
  },
  {
    id: 'lifestyle-inflation',
    text: {
      es: 'Evita la inflación de estilo de vida: cuando suba tu sueldo, aumenta primero el ahorro.',
      en: 'Avoid lifestyle inflation: when your salary rises, increase savings first.',
    },
  },
  {
    id: 'compare-apr',
    text: {
      es: 'Compara la tasa anual (TAE/APR), no la cuota mensual: ahí se esconde el costo real.',
      en: 'Compare the annual rate (APR), not the monthly payment: that’s where the real cost hides.',
    },
  },
  {
    id: 'pay-on-time',
    text: {
      es: 'Paga siempre a tiempo y al menos el mínimo: los intereses y las multas por mora destruyen un presupuesto.',
      en: 'Always pay on time and at least the minimum: interest and late fees destroy a budget.',
    },
  },
  {
    id: 'separate-accounts',
    text: {
      es: 'Separa las cuentas: una para gastos y otra para ahorro. Ver dos números evita que se mezclen.',
      en: 'Keep accounts separate: one for spending, one for savings. Two numbers stop them from mixing.',
    },
  },
  {
    id: 'compound-interest',
    text: {
      es: 'El interés compuesto hace que el tiempo valga más que el monto inicial: empieza aunque sea poco.',
      en: 'Compound interest makes time matter more than the starting amount: start even if it’s small.',
    },
  },
  {
    id: 'debt-before-investing',
    text: {
      es: 'Antes de invertir, cubre tus deudas de interés alto: ninguna inversión segura rinde como una deuda cara.',
      en: 'Before investing, clear high-interest debt: no safe investment beats an expensive debt.',
    },
  },
  {
    id: 'check-credit',
    text: {
      es: 'Revisa tu reporte de crédito al menos dos veces al año: los errores detectados a tiempo ahorran dinero.',
      en: 'Check your credit report at least twice a year: errors caught early save money.',
    },
  },
  {
    id: 'budget-for-fun',
    text: {
      es: 'Presupuesta también los gustos: un presupuesto sin ocio dura muy poco.',
      en: 'Budget for fun too: a budget with no joy never lasts.',
    },
  },
  {
    id: 'windfalls',
    text: {
      es: 'Con un bono o dinero inesperado, usa al menos la mitad para ahorrar o pagar deuda antes de gastarlo.',
      en: 'With a bonus or windfall, use at least half to save or repay debt before spending it.',
    },
  },
  {
    id: 'diversify',
    text: {
      es: 'Diversifica: no pongas todo en un solo activo, un solo banco o una sola idea.',
      en: 'Diversify: don’t put everything into one asset, one bank or one idea.',
    },
  },
  {
    id: 'earn-more',
    text: {
      es: 'Invierte en aprender un oficio o herramienta que aumente tus ingresos: el mejor ahorro es ganar más.',
      en: 'Invest in learning a skill that raises your income: the best saving is earning more.',
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
]

/** Devuelve la versión del idioma activo. */
export function pickText(text: LocalizedText, locale: Locale): string {
  return locale === 'en-US' ? text.en : text.es
}

/** Índice del día dentro del año (1 = 1 de enero). */
function dayOfYear(date: Date): number {
  const yearStart = Date.UTC(date.getFullYear(), 0, 0)
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((current - yearStart) / 86_400_000)
}

/** Rotación diaria determinística: el mismo día muestra lo mismo siempre. */
export function tipOfTheDay(date: Date = new Date()): Tip {
  return TIPS[dayOfYear(date) % TIPS.length]
}

export function quoteOfTheDay(date: Date = new Date()): Quote {
  // +7 para que la frase del día no siempre “empareje” con el mismo tip.
  return QUOTES[(dayOfYear(date) + 7) % QUOTES.length]
}
