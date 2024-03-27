const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  username: process.env.user,
  password: process.env.password,
  database: process.env.database,
  host: process.env.host,
  dialect: "mysql",
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.log("Unable to connect to the database:", error);
  }
}

const testAndSync = async () => {
  await testConnection();
};

module.exports = {
  testAndSync,
  sequelize,
};
