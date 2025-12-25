const { prisma } = require('../prisma/client');

async function getAllAttributeValues(req, res) {
  try {
    const attributeValues = await prisma.attributeValue.findMany();
    res.status(200).json(attributeValues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllAttributeValues };