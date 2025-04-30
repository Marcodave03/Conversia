import type React from "react"
import { useState } from "react"
import { X, Camera, Mail, Phone, MapPin, Globe, Edit2, Save } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

interface ProfileProps {
  onClose: () => void
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const [editing, setEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
    bio: "Senior software developer with 5+ years of experience in React, Node.js, and cloud technologies. Passionate about creating intuitive user experiences and scalable applications.",
  })

  const handleEdit = () => {
    setEditing(!editing)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] h-full">
          {/* Sidebar */}
          <div className="border-r dark:border-gray-700 p-6 flex flex-col items-center">
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img src="/placeholder.svg?height=128&width=128" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg">
                <Camera className="h-4 w-4" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-center mb-1">{userData.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">Product Designer</p>

            <div className="w-full space-y-4 mt-2">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{userData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{userData.website}</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <Button variant="outline" size="sm" onClick={handleEdit} className="flex items-center gap-1">
                    {editing ? (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4" />
                        <span>Edit</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editing ? (
                        <Input id="name" name="name" value={userData.name} onChange={handleChange} />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 p-2">{userData.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      {editing ? (
                        <Input id="email" name="email" type="email" value={userData.email} onChange={handleChange} />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 p-2">{userData.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      {editing ? (
                        <Input id="phone" name="phone" value={userData.phone} onChange={handleChange} />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 p-2">{userData.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {editing ? (
                        <Input id="location" name="location" value={userData.location} onChange={handleChange} />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 p-2">{userData.location}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      {editing ? (
                        <Input id="website" name="website" value={userData.website} onChange={handleChange} />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 p-2">{userData.website}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {editing ? (
                      <Textarea id="bio" name="bio" value={userData.bio} onChange={handleChange} rows={4} />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 p-2">{userData.bio}</p>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "Node.js", "UI/UX", "Tailwind CSS", "Next.js"].map((skill) => (
                      <div key={skill} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </div>
                    ))}
                    {editing && (
                      <Button variant="outline" size="sm" className="rounded-full">
                        + Add Skill
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Preferences</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email about account activity</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                    </div>
                    <Switch id="dark-mode" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Security Settings</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button className="mt-2">Update Password</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile