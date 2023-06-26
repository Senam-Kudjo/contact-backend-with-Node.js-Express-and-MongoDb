const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");

//description : Get All Contacts, route = GET /api/contacts, access to API = private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_id: req.user.id });
  res.status(200).json(contacts);
});

//description :  Get Contact, route = POSTT /api/contacts, access to API = private
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found!");
  }
  res.status(200).json(contact);
});

//description : Create Contact, route = POSTT /api/contacts, access to API = private
const createContact = asyncHandler(async (req, res) => {
  console.log("The request body is", req.body);
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  const contact = await Contact.create({
    name,
    email,
    phone,
    user_id: req.user.id,
  });
  res.status(201).json(contact);
});

//description :  Update contact, route = PUT /api/contacts, access to API = private
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found!");
  }

  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to update other User contacts"
    );
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedContact);
});

//description :  Delete a contact, route = DELETE /api/contacts, access to API = public
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndRemove(req.params.id, req.body);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found!");
  }

  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to delete other User contacts"
    );
  }
  // await Contact.deleteOne({_id:req.params.id})
  res.status(200).json(contact);
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
