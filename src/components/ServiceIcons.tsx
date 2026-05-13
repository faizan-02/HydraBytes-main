import React from 'react';
import {
  FiCode,
  FiSmartphone,
  FiCpu,
  FiCloud,
  FiBarChart2,
  FiLayers,
  FiClock,
  FiShield,
} from 'react-icons/fi';
import { GlassIcon } from './ui/GlassIcons';

type IconProps = { size?: number };

/* ---------- Service tile icons ---------- */
export const WebDevIcon: React.FC<IconProps> = ({ size = 44 }) => (
  <GlassIcon icon={<FiCode />} color="blue" size={size} />
);

export const MobileAppIcon: React.FC<IconProps> = ({ size = 44 }) => (
  <GlassIcon icon={<FiSmartphone />} color="indigo" size={size} />
);

export const AIMLIcon: React.FC<IconProps> = ({ size = 44 }) => (
  <GlassIcon icon={<FiCpu />} color="purple" size={size} />
);

export const CloudDevOpsIcon: React.FC<IconProps> = ({ size = 44 }) => (
  <GlassIcon icon={<FiCloud />} color="green" size={size} />
);

/* ---------- Stats tile icons ---------- */
export const ProjectsIcon: React.FC<IconProps> = ({ size = 40 }) => (
  <GlassIcon icon={<FiBarChart2 />} color="blue" size={size} />
);

export const TechStackIcon: React.FC<IconProps> = ({ size = 40 }) => (
  <GlassIcon icon={<FiLayers />} color="orange" size={size} />
);

export const OnTimeIcon: React.FC<IconProps> = ({ size = 40 }) => (
  <GlassIcon icon={<FiClock />} color="indigo" size={size} />
);

export const SupportIcon: React.FC<IconProps> = ({ size = 40 }) => (
  <GlassIcon icon={<FiShield />} color="green" size={size} />
);
