import { User } from "../model/user.model.js";
import cloudinary from "../utils/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {
  try {
    const userConnections = await User.findById(req.user._id).select(
      "connections"
    );
    const suggestedUsers = await User.find({
      _id: { $nin: userConnections.connections, $ne: req.user._id },
    })
      .select("name username profilePicture headline")
      .limit(3);
    res.status(200).json({ success: true, content: suggestedUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error in getSuggestedConnections",
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, content: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error in getPublicProfile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg);
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
