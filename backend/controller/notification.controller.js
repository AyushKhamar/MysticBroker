import { User } from "../model/user.model.js";
import Notification from "../model/notification.model.js";
export const getUserNotifications = async (req, res) => {
  try {
    const id = req.user._id;
    const notifications = await Notification.find({ recipient: id })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");
    return res.status(200).json({ success: true, content: notifications });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getUserNotifications",
    });
  }
};
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const read = await Notification.findByIdAndUpdate(
      { _id: id, recipient: req.user._id },
      { read: true }
    );
    return res.status(200).json({ success: true, content: read });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in markNotificationAsRead",
    });
  }
};
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Notification.findByIdAndDelete({
      _id: id,
      recipient: req.user._id,
    });
    return res.status(200).json({ success: true, content: deleted });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in deleteNotification",
    });
  }
};
