// modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')
// modulos internos
const fs = require('fs')

operation()
function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
          'Criar Conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Sair'
        ]
      }
    ])
    .then(res => {
      const action = res['action']

      // console.log(action)
      if (action == 'Criar Conta') {
        createAccount()
      } else if (action == 'Consultar Saldo') {
        getAccountBalance()
      } else if (action == 'Depositar') {
        deposit()
      } else if (action == 'Sacar') {
        withdraw()
      } else if (action == 'Sair') {
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        // encerra o sistema
        process.exit()
      }
    })
    .catch(error => console.log(error))
}

// criar conta

function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
  console.log(chalk.green('Defina as opções de sua conta a seguir'))
  buildAccount()
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para a sua conta:'
      }
    ])
    .then(res => {
      const accountName = res['accountName']
      console.info(accountName)

      // criando diretorio para armazenar as contas
      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts')
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        // se a conta já existe, imprime a msg e redireciona para o começo de buildAccount novamente
        console.log(
          chalk.bgRed.black('Esta conta já existe, escolha outro nome!')
        )
        buildAccount()
        return // impede a continuação do programa
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0} ',
        function (err) {
          console.log(err)
        }
      )

      console.log(chalk.green('Parabéns, a sua conta foi criada!'))
      operation()
    })
    .catch(err => console.log(err))
}

// adiciona uma quantia para a conta

function deposit() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
      }
    ])
    .then(res => {
      const accountName = res['accountName']

      // verificando a conta
      if (!checkAccount(accountName)) {
        return deposit()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja depositar?'
          }
        ])
        .then(res => {
          const amount = res['amount']

          addAmount(accountName, amount)

          operation()
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Esta conta não existe, tente novamente!'))
    return false
  }
  return true
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log('Ocorreu um erro, tente novamente!')
    return deposit()
  }
  // console.log(account)
  accountData.balance += parseFloat(amount)
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    }
  )

  console.log(chalk.green(`O valor de ${amount} foi depositado em sua conta!`))
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf-8',
    flag: 'r'
  })
  return JSON.parse(accountJSON)
}

// mostrar saldo

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
      }
    ])
    .then(res => {
      const accountName = res['accountName']

      // verifica se a conta existe
      if (!checkAccount(accountName)) {
        console.log('Conta invalida!')
        return getAccountBalance()
      }
      const accountData = getAccount(accountName)

      console.log(
        chalk.bgBlue.black(
          `Olá ${accountName}, o saldo da sua conta é de: R$${accountData.balance} `
        )
      )
      operation()
    })
    .catch(err => console.log(err))
}

// sacar o valor da conta

function withdraw() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
      }
    ])
    .then(res => {
      const accountName = res['accountName']
      if (!checkAccount(accountName)) {
        console.log('Conta invalida!')
        return withdraw()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?'
          }
        ])
        .then(res => {
          const amount = res['amount']
          const accountData = getAccount(accountName)

          if (!amount) {
            console.log('Ocorreu um erro, tente novamente!')
            return withdraw()
          }
          // console.log(account)

          if (accountData.balance < amount) {
            console.log(chalk.bgRed.black('Valor indisponível!'))
            console.log(`Seu saldo é de ${accountData.balance}`)
            return withdraw()
          }
          accountData.balance -= parseFloat(amount)
          fs.writeFileSync(
            `accounts/${accountName}.json`,
            JSON.stringify(accountData),
            function (err) {
              console.log(err)
            }
          )
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}
