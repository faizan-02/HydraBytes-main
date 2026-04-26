"use client"
import React, { useEffect, useState, useMemo, memo, createContext, useContext } from 'react';
import { useTheme } from '@/lib/ThemeContext';

type GlowColor = 'cyan' | 'purple';

interface SkillDef {
  id: string;
  label: string;
  svg: () => React.JSX.Element;
}

interface SkillConfig {
  id: string;
  orbitRadius: number;
  size: number;
  speed: number;
  phaseShift: number;
  glowColor: GlowColor;
  label: string;
  svg: () => React.JSX.Element;
}

const DarkCtx = createContext(true);

const allSkills: SkillDef[] = [
  { id: 'react', label: 'React', svg: () => <svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><g stroke="#61DAFB" strokeWidth="1" fill="none"><circle cx="12" cy="12" r="2.05" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="11" ry="4.2"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/></g></svg> },
  { id: 'python', label: 'Python', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.914 0zM8.708 1.85a1.049 1.049 0 110 2.098 1.049 1.049 0 010-2.098z" fill="#3776AB"/><path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.451s-3.24-.052-3.24 3.148v5.292S5.72 24 12.086 24zm3.206-1.85a1.049 1.049 0 110-2.098 1.049 1.049 0 010 2.098z" fill="#FFD43B"/></svg> },
  { id: 'nodejs', label: 'Node.js', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.602.065-.037.151-.023.218.017l2.256 1.339a.36.36 0 00.275 0l8.795-5.076a.247.247 0 00.135-.241V6.921a.255.255 0 00-.137-.246l-8.791-5.072a.27.27 0 00-.273 0L2.075 6.675a.252.252 0 00-.139.246v10.146c0 .1.055.194.139.241l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L1.352 18.675C.533 18.215 0 17.352 0 16.43V6.284c0-.922.533-1.786 1.352-2.245L10.147.037c.8-.452 1.866-.452 2.657 0l8.796 5.002c.819.459 1.352 1.323 1.352 2.245v10.146c0 .922-.533 1.783-1.352 2.245l-8.796 5.078c-.28.163-.601.247-.926.247z" fill="#339933"/></svg> },
  { id: 'tensorflow', label: 'TensorFlow', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603L4.366 9.39 1.292 7.6zm21.416 0L12.46 0v24l4.095-2.378V7.603l3.079 1.787 3.074-1.79z" fill="#FF6F00"/></svg> },
  { id: 'swift', label: 'Swift', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M7.168 19.032c-3.608-2.593-5.96-6.94-4.86-11.096.396-1.497 1.225-2.88 2.476-3.888-.156.396-.264.804-.312 1.224-.396 3.444 2.94 6.672 2.94 6.672s-2.076-3.24-1.236-6.132c.516-1.776 2.1-3.12 3.384-4.2 1.476-1.248 3.156-2.34 5.04-2.856-2.028 2.388-1.14 4.836.744 7.14 1.884 2.304 3.876 3.468 3.456 6.468-.12.84-.42 1.668-.888 2.424 1.068-1.044 1.776-2.4 2.04-3.876 1.464 2.604 1.464 5.784-.528 8.196-2.736 3.312-7.536 4.164-11.592 2.52-.276-.108-.54-.24-.804-.384l-.072-.036c2.748.588 5.796-.18 7.632-2.268-1.788.528-3.744.264-5.244-.684l-.012-.012c1.848.204 3.648-.48 4.812-1.812-1.488.312-3.024-.084-4.152-1.032l-.024-.012c1.668.36 3.312-.432 4.212-1.86-2.28.792-4.836.36-6.72-1.14l-.06-.036c3.948 2.196 8.04 1.704 8.04 1.704-3.312 1.824-7.092 1.38-8.172.864z" fill="#F05138"/></svg> },
  { id: 'firebase', label: 'Firebase', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M3.89 15.672L6.255 1.618a.413.413 0 01.775-.122l2.542 4.744-5.682 9.432z" fill="#FFA000"/><path d="M20.11 18.67L17.744 3.16a.413.413 0 00-.717-.19L3.89 15.672l7.267 4.187a1.24 1.24 0 001.23 0l7.723-4.449v-.74z" fill="#F57C00"/><path d="M12.387 19.859a1.24 1.24 0 01-1.23 0L3.89 15.672 6.255 1.618a.413.413 0 01.775-.122l2.542 4.744 1.255-2.38a.413.413 0 01.73 0l8.553 14.81-7.723 4.449v-.26z" fill="#FFCA28"/></svg> },
  { id: 'nextjs', label: 'Next.js', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><circle cx="12" cy="12" r="11.5" fill="currentColor"/><path d="M9.5 8v8.5h1.3V10l5.5 8.8c.3-.2.6-.4.8-.7L10.5 8H9.5z" style={{ fill: 'var(--bg-primary)' }}/><path d="M15.2 8v5.5l1.3 1.6V8h-1.3z" style={{ fill: 'var(--bg-primary)' }}/></svg> },
  { id: 'flutter', label: 'Flutter', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M14.314 0L2.3 12 6.35 16.05 22.364 0zm0 11.066L7.758 16.632l6.556 6.556h8.05l-6.556-6.556 6.556-6.556z" fill="#02569B"/><path d="M7.758 16.632l6.556-5.566L18.364 15.116l-4.05 4.05z" fill="#13B9FD"/></svg> },
  { id: 'docker', label: 'Docker', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.186.186 0 00-.185.185v1.888c0 .102.082.185.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.186.186 0 00-.185.185v1.888c0 .102.082.185.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.186.186 0 00-.185.185v1.888c0 .102.083.185.185.186zm-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.186.186 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.186zm5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.887c0 .102.082.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.184.186v1.887c0 .102.083.185.185.185zm-2.964 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185zm-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.887c0 .102.082.185.185.185zM23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z" fill="#2496ED"/></svg> },
  { id: 'git', label: 'Git', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.66 2.66c.645-.222 1.387-.078 1.9.435.72.72.72 1.884 0 2.604-.72.719-1.886.719-2.605 0-.538-.536-.673-1.33-.404-1.996l-2.48-2.48v6.53c.175.087.34.202.487.348.72.72.72 1.883 0 2.604-.72.72-1.886.72-2.605 0-.72-.72-.72-1.884 0-2.604.182-.181.39-.318.615-.41v-6.59c-.225-.09-.433-.228-.615-.41-.54-.54-.676-1.334-.396-2.013L7.578 4.4.452 11.528c-.604.603-.604 1.582 0 2.186l10.48 10.477c.604.604 1.582.604 2.186 0l10.428-10.428c.604-.603.604-1.582 0-2.186" fill="#F05032"/></svg> },
  { id: 'mongodb', label: 'MongoDB', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.238c.083-.396.16-.835.233-1.304.575-.35 4.252-2.76 4.812-8.093v-.003a18.395 18.395 0 000-5.045z" fill="#00ED64"/><path d="M12.148 24c.083-.396.16-.835.233-1.304.575-.35 4.252-2.76 4.812-8.093v-.003c-.003-.02-.004-.043-.007-.064-1.264-5.58-4.252-7.414-4.573-8.115a9.93 9.93 0 01-.474-.91v19.382l.01.057-.001.05z" fill="#00AA4F"/></svg> },
  { id: 'tailwind', label: 'Tailwind', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="#06B6D4"/></svg> },
  { id: 'vercel', label: 'Vercel', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M24 22.525H0l12-21.05z" fill="currentColor"/></svg> },
  { id: 'aws', label: 'AWS', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.256-.248-.686-.367-1.3-.367-.28 0-.568.032-.863.104-.296.072-.583.16-.863.272a2.287 2.287 0 01-.28.104.488.488 0 01-.127.024c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 01.224-.167c.28-.144.616-.264 1.01-.36a4.84 4.84 0 011.244-.152c.95 0 1.644.216 2.091.647.44.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .535-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.048-.191.08-.423.08-.694v-.335a6.66 6.66 0 00-.735-.136 6.02 6.02 0 00-.75-.048c-.535 0-.926.104-1.19.32-.263.216-.39.535-.39.95 0 .39.1.678.303.862.196.192.478.287.83.287zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.152-.168-.311L7.586 5.55a1.398 1.398 0 01-.072-.32c0-.128.064-.2.191-.2h.783c.152 0 .256.024.32.08.063.048.112.152.16.312l1.342 5.284 1.245-5.284c.04-.168.088-.264.152-.312a.549.549 0 01.32-.08h.638c.152 0 .256.024.32.08.064.048.12.152.152.312l1.261 5.348 1.381-5.348c.048-.168.104-.264.168-.312a.543.543 0 01.32-.08h.743c.128 0 .2.064.2.2 0 .04-.008.08-.016.128a1.137 1.137 0 01-.056.2l-1.923 6.17c-.048.16-.104.264-.168.312a.549.549 0 01-.32.08h-.687c-.152 0-.256-.024-.32-.08-.063-.056-.12-.16-.152-.32l-1.237-5.148-1.23 5.14c-.04.168-.088.272-.152.327-.064.048-.176.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.216-.151-.248-.223a.504.504 0 01-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.216.878.28.32.064.632.096.95.096.503 0 .894-.088 1.165-.264a.86.86 0 00.415-.758.777.777 0 00-.215-.559c-.144-.151-.415-.287-.806-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 01-.4-1.158c0-.335.073-.63.216-.886.144-.255.336-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.176 0 .36.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 01.24.2.43.43 0 01.071.263v.375c0 .168-.064.256-.184.256a.83.83 0 01-.303-.096 3.652 3.652 0 00-1.532-.311c-.455 0-.815.072-1.062.223-.248.152-.375.383-.375.694 0 .224.08.416.24.567.16.152.454.304.87.44l1.133.358c.574.184.99.44 1.237.767.248.328.367.703.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.51-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z" fill="#252F3E"/><path d="M21.725 18.2c-2.67 1.975-6.545 3.025-9.88 3.025-4.674 0-8.882-1.727-12.066-4.603-.25-.227-.025-.535.275-.36 3.44 2 7.693 3.206 12.09 3.206 2.963 0 6.222-.615 9.222-1.887.454-.192.832.303.36.62z" fill="#FF9900"/><path d="M22.834 16.917c-.342-.438-2.262-.208-3.126-.104-.263.032-.303-.2-.066-.36 1.53-1.075 4.04-.766 4.332-.405.295.367-.08 2.894-1.512 4.102-.22.184-.43.087-.334-.16.327-.806 1.048-2.636.706-3.073z" fill="#FF9900"/></svg> },
  { id: 'figma', label: 'Figma', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/><path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/></svg> },
  { id: 'kotlin', label: 'Kotlin', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><defs><linearGradient id="kt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E44857"/><stop offset="50%" stopColor="#C711E1"/><stop offset="100%" stopColor="#7F52FF"/></linearGradient></defs><path d="M0 0h24L12.222 11.778 24 24H0V0z" fill="url(#kt)"/></svg> },
  { id: 'supabase', label: 'Supabase', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M13.7 21.8c-.4.5-1.3.2-1.3-.5V13h8.6c.8 0 1.3 1 .7 1.6L13.7 21.8z" fill="#3ECF8E"/><path d="M10.3 2.2c.4-.5 1.3-.2 1.3.5V11H3c-.8 0-1.3-1-.7-1.6L10.3 2.2z" fill="#3ECF8E" opacity=".6"/></svg> },
  { id: 'angular', label: 'Angular', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M12 2.5L3.5 5.8l1.3 11.3L12 21.5l7.2-4.4 1.3-11.3L12 2.5zm0 2.15l6.15 11.1h-2.3L14.3 12.5H9.7l-1.55 3.25h-2.3L12 4.65zm0 3.75L10.15 12h3.7L12 8.4z" fill="#DD0031"/></svg> },
  { id: 'vue', label: 'Vue.js', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M24 1.61h-6.892L12 8.72 6.892 1.61H0l12 20.78z" fill="#41B883"/><path d="M24 1.61h-6.892L12 8.72 6.892 1.61H3.364L12 16.65l8.636-15.04z" fill="#34495E"/></svg> },
  { id: 'pytorch', label: 'PyTorch', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M12.005 0L4.952 7.053a9.865 9.865 0 000 13.94 9.866 9.866 0 0013.94 0 9.865 9.865 0 000-13.94l-3.483 3.483a4.778 4.778 0 01.005 6.676 4.758 4.758 0 01-6.733 0 4.758 4.758 0 010-6.733l4.842-4.842L12.005 0z" fill="#EE4C2C"/><circle cx="16.25" cy="4.5" r="1.5" fill="#EE4C2C"/></svg> },
  { id: 'dart', label: 'Dart', svg: () => <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 011.481-.315c.766.047 1.677.788 1.677.788L24 9.948v9.789h-4.263V24H9.789l-9.684-6L6.316 12z" fill="#0175C2"/><path d="M13.842 24L24 13.684V19.7L18.316 24z" fill="#1C2834" opacity=".4"/><path d="M4.105 4.105L13.158 13.158H24V9.948z" fill="white" opacity=".5"/></svg> },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface OrbitingSkillProps {
  config: SkillConfig;
  angle: number;
  scale: number;
}

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
  animationDelay?: number;
  scale?: number;
}

const OrbitingSkill = memo(({ config, angle, scale }: OrbitingSkillProps) => {
  const isDark = useContext(DarkCtx);
  const [isHovered, setIsHovered] = useState(false);
  const size = Math.round(config.size * scale);
  const r = config.orbitRadius * scale;

  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;

  const SvgIcon = config.svg;

  return (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 20 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full p-2 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
        style={{
          background: 'transparent',
          border: 'none',
          transform: isHovered ? 'scale(1.25)' : 'scale(1)',
          boxShadow: 'none',
        }}
      >
        <SvgIcon />
        {isHovered && (
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap pointer-events-none"
            style={{ color: isDark ? '#c0c0e0' : '#4a4a6a' }}
          >
            {config.label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingSkill.displayName = 'OrbitingSkill';

const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0, scale = 1 }: GlowingOrbitPathProps) => {
  const isDark = useContext(DarkCtx);

  const darkColors = {
    cyan: { primary: 'rgba(6, 182, 212, 0.12)', secondary: 'rgba(6, 182, 212, 0.06)', border: 'rgba(6, 182, 212, 0.18)' },
    purple: { primary: 'rgba(147, 51, 234, 0.12)', secondary: 'rgba(147, 51, 234, 0.06)', border: 'rgba(147, 51, 234, 0.18)' },
  };

  const lightColors = {
    cyan: { primary: 'rgba(6, 182, 212, 0.1)', secondary: 'rgba(6, 182, 212, 0.04)', border: 'rgba(6, 182, 212, 0.2)' },
    purple: { primary: 'rgba(147, 51, 234, 0.1)', secondary: 'rgba(147, 51, 234, 0.04)', border: 'rgba(147, 51, 234, 0.2)' },
  };

  const colors = (isDark ? darkColors : lightColors)[glowColor];

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{ width: `${radius * scale * 2}px`, height: `${radius * scale * 2}px` }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 20px ${colors.primary}, inset 0 0 20px ${colors.secondary}`,
          animation: 'pulse 4s ease-in-out infinite',
          animationDelay: `${animationDelay}s`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${isDark ? 1 : 2}px solid ${colors.border}`,
          boxShadow: isDark
            ? `inset 0 0 8px ${colors.secondary}`
            : `inset 0 0 10px ${colors.secondary}, 0 0 8px ${colors.primary}`,
        }}
      />
    </div>
  );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

export default function OrbitingSkills() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scale, setScale] = useState(1);

  const skills = useMemo<SkillConfig[]>(() => {
    const picked = shuffle(allSkills).slice(0, 6);
    return picked.map((s, i) => {
      const isInner = i < 3;
      return {
        id: s.id,
        label: s.label,
        svg: s.svg,
        orbitRadius: isInner ? 100 : 180,
        size: isInner ? 44 : 46,
        speed: isInner ? 1 : -0.6,
        phaseShift: (i % 3) * ((2 * Math.PI) / 3),
        glowColor: isInner ? 'cyan' as const : 'purple' as const,
      };
    });
  }, []);

  useEffect(() => {
    const update = () => setScale(window.innerWidth < 768 ? 0.8 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime(prevTime => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
    { radius: 100, glowColor: 'cyan', delay: 0 },
    { radius: 180, glowColor: 'purple', delay: 1.5 }
  ];

  return (
    <DarkCtx.Provider value={isDark}>
      <div className="w-full flex items-center justify-center overflow-visible">
        <div
          className="relative flex items-center justify-center"
          style={{ width: `${Math.round(420 * scale)}px`, height: `${Math.round(420 * scale)}px` }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative z-10 flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: `${Math.round(140 * scale)}px`,
                height: `${Math.round(140 * scale)}px`,
                background: isDark
                  ? 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <div
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${Math.round(120 * scale)}px`,
                height: `${Math.round(120 * scale)}px`,
                background: isDark
                  ? 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, transparent 70%)',
                filter: 'blur(16px)',
                animationDuration: '3s',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/transparent.png"
              alt="HydraBytes"
              style={{
                width: `${Math.round(120 * scale)}px`,
                height: 'auto',
                objectFit: 'contain',
                filter: isDark
                  ? 'drop-shadow(0 0 24px rgba(6, 182, 212, 0.2))'
                  : 'drop-shadow(0 0 12px rgba(124, 58, 237, 0.12))',
                position: 'relative',
                zIndex: 2,
              }}
            />
          </div>

          {orbitConfigs.map((config) => (
            <GlowingOrbitPath
              key={`path-${config.radius}`}
              radius={config.radius}
              glowColor={config.glowColor}
              animationDelay={config.delay}
              scale={scale}
            />
          ))}

          {skills.map((config) => {
            const angle = time * config.speed + config.phaseShift;
            return (
              <OrbitingSkill
                key={config.id}
                config={config}
                angle={angle}
                scale={scale}
              />
            );
          })}
        </div>
      </div>
    </DarkCtx.Provider>
  );
}
