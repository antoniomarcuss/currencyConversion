
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currency-container"]') 
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document
.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEll = document
.querySelector('[data-js="currency-one-times"]')

const showAlert = err => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err.message
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  div.setAttribute('role', 'alert')
  button.classList.add('btn-close')

  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Close')

  const removeAlert = () => div.remove()

  button.addEventListener('click', removeAlert )
  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}


const state = (() => {
  let exchangeRate = {}
  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.conversion_rates){
        showAlert({
          message: 'O objeto precisa ter uma propriedade conversion_rates'})
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const APIKey = '2423ccc1f686d163a55ef630'
const getUrl = currency => 
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}` 


const getErrormessage = errorType => ({
  'unsupported-code': 'A moeda não existe em nosso banco de dados.',
  'malformed-request': 'O endpoint do seu request não existe.',
  'invalid-key': 'A chave da API não é válida.',
  'quota-reached': 'Sua conta alcançou o limite de requests permitido em seu plano atual.',
  'not-available-on-plan': 'Seu plano atual não permite este tipo de request.'
})[errorType] || 'Não foi possível obter as informações.'



const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)

    if(!response.ok) {
      throw new Error('Sua conexão falhou. Não foi possível obter as informações')
    }
    const exchangeRateData = await response.json()

   if(exchangeRateData.result === 'error'){
    const errorMessage = getErrormessage(exchangeRateData['error-type'])
    throw new Error(errorMessage)
   }

   return state.setExchangeRate(exchangeRateData)

  } catch (err) {
    showAlert(err)
  }
}

const getOptions = (selectedCurrency, conversion_rates) => {
  const setSelectedAttribute = currency => 
    currency === selectedCurrency ? 'selected' : ''
  const getOptionsAsArray = currency => 
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`
  return Object.keys(conversion_rates)
  .map(getOptionsAsArray)
  .join('')
}

const getMultiplieExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (timesCurrencyOneEll.value * currencyTwo).toFixed(2)
}

const getNotRoundedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo } ${currencyTwoEl.value}`
}

const showUpdatedRates = ({conversion_rates}) => {
  convertedValueEl.textContent = getMultiplieExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
} 

const showInitialInfo = ({conversion_rates}) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

 showUpdatedRates({conversion_rates})
}

const init = async () => {
  const url = getUrl('USD')
  const exchangerate = await fetchExchangeRate(url)
  
  if(exchangerate && exchangerate.conversion_rates){
    showInitialInfo(exchangerate)
  }
}

const handleTimesCurrencyOneEllInput = () => {
  const {conversion_rates} = state.getExchangeRate()
  convertedValueEl.textContent = getMultiplieExchangeRate(conversion_rates)
}

const handleCurrencyTwoElInput = () => {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
}

const handleCurrencyOneElInput = async e => {
  const url = getUrl(e.target.value)
  const exchangeRate = await fetchExchangeRate(url)

  showUpdatedRates(exchangeRate)
}

timesCurrencyOneEll.addEventListener('input',handleTimesCurrencyOneEllInput )
currencyTwoEl.addEventListener('input',handleCurrencyTwoElInput )
currencyOneEl.addEventListener('input',handleCurrencyOneElInput )

init()

// }
