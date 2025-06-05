"use client";
import React, { useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import userService from "@/api/userService";
import { log } from "console";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dob: user?.dob || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Validate and format dob as ISO 8601 or null
      const formattedData = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      };

      await userService.updateProfile(formattedData);
      setUser((prev) => (prev ? { ...prev, ...formattedData } : null));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      dob: user?.dob || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and GIF images are supported");
      return;
    }

    try {
      setUploading(true);

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("avatar", file);

      // Gọi API upload avatar với xử lý phản hồi linh hoạt hơn
      const response = await userService.uploadAvatar(formData);
      console.log("Avatar upload response:", response);

      // Xử lý phản hồi từ API một cách linh hoạt hơn
      let avatarUrl: string | undefined;

      // Kiểm tra các cấu trúc phản hồi có thể có
      if (response.payload?.data?.avatarUrl) {
        avatarUrl = response.payload.data.avatarUrl;
      } else if (typeof response.payload === "string") {
        avatarUrl = response.payload;
      }

      if (avatarUrl) {
        setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
        toast.success("Avatar updated successfully");
      } else {
        toast.error("Couldn't get avatar URL from response");
        console.error("Unexpected response format:", response)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Avatar and Basic Info Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-4xl">
                      {user?.fullName ? user?.fullName[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Hidden file input để upload avatar */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />

                  <button
                    className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {user?.fullName || "User"}
                </h2>

                <div className="flex justify-center mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                  >
                    {user?.email}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">12</div>
                    <div className="text-sm text-gray-600">Orders</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mt-10">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-red-50 hover:border-red-300"
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Profile Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => {
                      setFormData({
                        fullName: user?.fullName || "",
                        phone: user?.phone || "",
                        address: user?.address || "",
                        dob: user?.dob || "",
                      });
                      setIsEditing(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700 flex items-center"
                  >
                    <User className="w-4 h-4 mr-2 text-indigo-500" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.fullName || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                    Email Address
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                    {user?.email}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Verified
                    </Badge>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700 flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-2 text-indigo-500" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.phone || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-medium text-gray-700 flex items-center"
                  >
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                      {new Date(user?.dob).toLocaleDateString() ||
                        "Not provided"}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700 flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                    Address
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 min-h-[80px]">
                      {user?.address || "Not provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
