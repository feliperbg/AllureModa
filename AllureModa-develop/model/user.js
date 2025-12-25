
const { prisma } = require('../prisma/client');

const createUser = async (data) => {
  const user = await prisma.user.create({
    data,
  });
  return user;
};

const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};

const updateUserById = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserById,
};
