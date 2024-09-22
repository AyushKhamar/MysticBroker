import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";
import ConnectionRequest from "../model/connectionRequest.model.js";
import Notification from "../model/notification.model.js";
import { User } from "../model/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;
    if (senderId.toString() === userId.toString())
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    if (req.user.connections.includes(userId))
      return res.status(400).json({
        success: false,
        message: "You are already connected with this user",
      });
    const alreadyConnected = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });
    if (alreadyConnected)
      return res.status(400).json({
        success: false,
        message: "Connection request already sent",
      });
    const request = await ConnectionRequest.create({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });
    return res.status(200).json({ success: true, content: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in sendConnectionRequest",
    });
  }
};
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name username email")
      .populate("recipient", "name username ");
    // Check if the request exists
    if (!request)
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    // Check if the recipient is the current user
    console.log(request.recipient._id.toString(), req.user._id.toString());
    if (request.recipient._id.toString() !== req.user._id.toString())
      return res.status(401).json({
        success: false,
        message: "You are not authorized to accept this request",
      });
    // Check if the request is already processed
    if (request.status !== "pending")
      return res.status(400).json({
        success: false,
        message: "Connection request already processed",
      });
    // Update the request status to accepted
    request.status = "accepted";
    await request.save();
    // Add the sender and recipient to each other's connections
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: req.user._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { connections: request.sender._id },
    });
    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: req.user._id,
    });
    await notification.save();

    //send email notification
    const senderEmail = request.sender.email;
    const senderName = request.sender.name;
    const recipientName = request.recipient.name;
    const profileUrl =
      process.env.CLIENT_URL + "/profile/" + request.recipient.username;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileUrl
      );
    } catch (error) {
      console.error("Error in sendConnectionAcceptedEmail:", error);
    }

    return res.status(200).json({ success: true, content: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in acceptConnectionRequest",
    });
  }
};
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const request = await ConnectionRequest.findById(requestId);
    if (request.recipient.toString() !== userId.toString())
      return res.status(401).json({
        success: false,
        message: "You are not authorized to reject this request",
      });
    if (request.status !== "pending")
      return res.status(400).json({
        success: false,
        message: "Connection request already processed",
      });
    request.status = "rejected";
    await request.save();
    return res.status(200).json({ success: true, content: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in rejectConnectionRequest",
    });
  }
};
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");
    return res.status(200).json({ success: true, content: requests });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getConnectionRequests",
    });
  }
};
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const connections = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );
    return res.status(200).json({ success: true, content: connections });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getUserConnections",
    });
  }
};
export const removeConnection = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;
    await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });
    return res
      .status(200)
      .json({ success: true, message: "Connection removed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in removeConnection",
    });
  }
};
export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;
    if (currentUser.connections.includes(targetUserId)) {
      return res
        .status(200)
        .json({ success: true, content: { status: "connected" } });
    }

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res
          .status(200)
          .json({ success: true, content: { status: "pending" } });
      } else {
        return res.status(200).json({
          success: true,
          content: { status: "received", requestId: pendingRequest._id },
        });
      }
    }

    // if no connection or pending req found
    res
      .status(200)
      .json({ success: true, content: { status: "not_connected" } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getConnectionStatus",
    });
  }
};
