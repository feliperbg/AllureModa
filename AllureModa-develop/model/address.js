
const { prisma } = require('../prisma/client');

const createAddress = async (data) => {
  const address = await prisma.address.create({
    data,
  });
  return address;
};

const findAllAddressesByUserId = async (userId) => {
  const addresses = await prisma.address.findMany({
    where: {
      userId,
    },
  });
  return addresses;
};

const updateAddress = async (id, data) => {
  const address = await prisma.address.update({
    where: {
      id,
    },
    data,
  });
  return address;
};

const deleteAddress = async (id) => {
  const address = await prisma.address.delete({
    where: {
      id,
    },
  });
  return address;
};

module.exports = {
  createAddress,
  findAllAddressesByUserId,
  updateAddress,
  deleteAddress,
};
