const mongoose = require("mongoose");
const MessageModel = require("../Model/message.model"); // adjust path if needed

// ✅ Replace these with actual User IDs from your DB
const receiverId  = new mongoose.Types.ObjectId("68ff052140c12dbe0d8f8d1e");
const senderId = new mongoose.Types.ObjectId("68ff082d40c12dbe0d8f8d26");
const conversationId = `${receiverId}-${senderId}`;

async function seedMessages() {
  try {
    await mongoose.connect("mongodb://localhost:27017/encrypted-chat"); // change DB name if needed
    console.log("✅ MongoDB connected");

    const messages = [];
    const TOTAL_MESSAGES = 2100;
    const BATCH_SIZE = 1000;

    for (let i = 0; i < TOTAL_MESSAGES; i++) {
      const randomMessage = [
        "Hello!",
        "How are you?",
        "What’s up?",
        "Let's meet soon.",
        "😂😂😂",
        "Good morning!",
        "See you later.",
        "I’m testing the chat.",
        "Random message " + i,
        "Okay bro!"
      ][Math.floor(Math.random() * 10)];

      const sender = Math.random() > 0.5 ? senderId : receiverId;

      messages.push({
        senderId: sender,
        receiverId: sender.equals(senderId) ? receiverId : senderId,
        conversationId,
        message: randomMessage,
        files: [],
        groupid: null,
        read: Math.random() > 0.8, // 20% messages read
        readBy: Math.random() > 0.8 ? sender : null, // ✅ valid ObjectId or null
        edited: Math.random() > 0.8 ? "true" : "false",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)),
        updatedAt: new Date(),
      });

      // insert in batches for performance
      if (messages.length >= BATCH_SIZE) {
        await MessageModel.insertMany(messages, { ordered: false });
        console.log(`✅ Inserted ${i + 1} messages`);
        messages.length = 0;
      }
    }

    // insert remaining
    if (messages.length > 0) {
      await MessageModel.insertMany(messages, { ordered: false });
    }

    console.log(`🎉 Inserted ${TOTAL_MESSAGES} fake messages!`);
  } catch (err) {
    console.error("❌ Error inserting messages:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedMessages();
