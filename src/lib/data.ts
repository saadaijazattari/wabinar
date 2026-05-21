import { Sparkle, Webcam } from "lucide-react";
import { HomeIcon } from "@/icons/Homeicon";
import { LeadIcon } from "@/icons/Leadicon";
import { SettingsIcon } from "@/icons/Settingsicon";
import { CallStatusEnum } from "@prisma/client";


export const sidebarData = [
  {
    id: 1,
    title: 'Home',
    icon: HomeIcon,
    link: '/home',
  },
  {
    id: 2,
    title: 'Webinars',
    icon: Webcam,
    link: '/webinars',
  },
  {
    id: 3,
    title: 'Leads',
    icon: LeadIcon,
    link: '/lead',
  },
  {
    id: 4,
    title: 'Ai Agents',
    icon: Sparkle,
    link: '/ai-agents',
  },
  {
    id: 5,
    title: 'settings',
    icon: SettingsIcon,
    link: '/ai-agents',
  },
]

export const onBoardingSteps = [
  { id: 1, title: 'Create a webinar', complete: false, link: '' },
  { id: 2, title: 'Get leads', complete: false, link: '' },
  { id: 3, title: 'Conversion status', complete: false, link: '' },
]

export const potentialCustomer = [
  {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    clerkId: "1",
    profileImage: "/vercel.svg",
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    tags: ["New", "Hot Lead"],
    callStatus: CallStatusEnum.COMPLETED,
  },
  {
  "id": "2",
  "name": "John Doe",
  "email": "johndoe@gmail.com",
  "clerkId": "2",
  "profileImage": "/vercel.svg",
  "isActive": true,
  "lastLoginAt": null,
  "createdAt": "2026-05-21T15:24:00.000Z", 
  "updatedAt": "2026-05-21T15:24:00.000Z",
  "deletedAt": null,
  "tags": ["New", "Hot Lead"],
  "callStatus": "COMPLETED" 
},
{
  id: "3",
  name: "John Doe",
  email: "johndoe@gmail.com",
  clerkId: "3",
  profileImage: "/vercel.svg",
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  tags: ["New", "Hot Lead"],
  callStatus: CallStatusEnum.COMPLETED, 
}


]


