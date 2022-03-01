const fs = require("fs")
const path = require("path")
const inquirer = require("inquirer")
const chalk = require("chalk")
const yargs = require("yargs/yargs")
const { hideBin } = require("yargs/helpers")

const { argv } = yargs(hideBin(process.argv))

console.log(`
  To use this starter, you'll need to create a new Drupal site
  and import the demo site's SQL dump file and files included in
  the starter /data directory, then provide the following environment variables:

    1. ${chalk.blue("Drupal Site Base URL")}
    2. ${chalk.blue("Username")}
    3. ${chalk.blue("Password")}

  The base URL, username and password will be used to source content for your Gatsby site.
`)

inquirer
  .prompt([
    {
      name: "baseUrl",
      message: "Base URL of the Drupal site",
      when: !argv.baseUrl && !process.env.DRUPAL_BASE_URL,
    },
    {
      name: "username",
      message: "User name",
      when: !argv.username && !process.env.DRUPAL_BASIC_AUTH_USERNAME,
    },
    {
      name: "password",
      message: "Password associated with the user name provided",
      when: !argv.password && !process.env.DRUPAL_BASIC_AUTH_PASSWORD,
    },
  ])
  .then(async ({ baseUrl, username, password }) => {
    // write env vars to .env.development & .env.production
    const dotenv = [
      `# All environment variables will be sourced`,
      `# and made available to gatsby-config.js, gatsby-node.js, etc.`,
      `# Do NOT commit this file to source control`,
      `DRUPAL_BASE_URL="${baseUrl}"`,
      `DRUPAL_BASIC_AUTH_USERNAME="${username}"`,
      `DRUPAL_BASIC_AUTH_PASSWORD="${password}"`,
    ].join("\n")
    const configFiles = [".env.development", ".env.production"]
      .map((name) => path.join(__dirname, "..", name))
      .forEach((filename) => {
        fs.writeFileSync(filename, dotenv, "utf8")
      })
    console.log(`.env files written`)
  })
  .catch((err) => {
    console.error(err)
  })
