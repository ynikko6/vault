import React, { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UserCircleIcon, CameraIcon } from "lucide-react"

export default function AccountPage() {
  const [name, setName] = useState<string>(() => localStorage.getItem("user_name") || "vault")
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem("user_avatar") || "/avatars/shadcn.jpg")
  const email = useMemo(() => localStorage.getItem("auth_email") || "m@example.com", [])
  const password = useMemo(() => localStorage.getItem("auth_password") || "", [])
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setAvatar(url)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    localStorage.setItem("user_name", name)
    localStorage.setItem("user_avatar", avatar)
    alert("Profile updated.")
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <h2 className="text-xl/7 font-semibold tracking-tight flex items-center gap-2">
        <UserCircleIcon className="size-5" />
        Account
      </h2>

      <Card className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <CameraIcon />
                Change Picture
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarPick}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid w-full max-w-md gap-3">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <Button onClick={handleSave} className="mt-2">Save Changes</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 lg:p-6">
        <div className="grid w-full max-w-md gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} readOnly />
          <Label htmlFor="password" className="mt-4">Password</Label>
          <div className="flex items-center gap-2">
            <Input id="password" type={showPassword ? "text" : "password"} value={password} readOnly />
            <Button variant="outline" size="sm" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Credentials are stored locally for demo purposes.</p>
        </div>
      </Card>
    </div>
  )
}