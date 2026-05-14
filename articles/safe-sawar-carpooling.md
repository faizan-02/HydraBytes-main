---
title: "Safe-Sawar: Building Pakistan's First NADRA-Verified Carpooling App with React Native"
published: true
tags: reactnative, mobile, firebase, typescript
canonical_url: https://www.hydrabytes.tech/portfolio/safe-sawar-women-first-carpooling
cover_image: https://www.hydrabytes.tech/portfolio/safe-sawar.png
---

Fuel prices in Pakistan have more than doubled in recent years. For millions of daily commuters, especially women, the options are limited: overcrowded public transport with safety concerns, expensive ride-hailing, or burning through a salary on petrol. Carpooling is the obvious solution, but existing platforms do not address the trust and safety barriers that prevent adoption.

We built **Safe-Sawar** (محفوظ سوار, "Safe Rider") to change that: Pakistan's first NADRA-verified carpooling platform with separate women and men sections, biometric identity verification, and an offline emergency SOS system.

## Why Existing Solutions Fall Short

Ride-sharing apps like Careem and InDrive connect strangers with no identity verification beyond a phone number. For women commuters, this is a non-starter. You should not have to take a stranger's word for who they are when getting into their car.

The trust problem goes deeper than just identity. Even with verification, how do you know the person is connected to your community? How do you send an SOS when you have no cell signal? These are the problems we set out to solve.

## The Core Features

### NADRA CNIC + Biometric Verification

Every Safe-Sawar user is verified through Pakistan's NADRA (National Database and Registration Authority) system. The onboarding flow requires:

1. CNIC (national ID) number entry
2. Biometric fingerprint or facial verification against NADRA records
3. Profile creation only after successful verification

This means every person on the platform is who they claim to be. No fake accounts, no anonymous riders.

### Women-First, With a Male Section

The app launches with a gender selection screen: Female or Male. The women's section was the original focus, offering women-only rides that are verified, private, and trusted. We later added a male section to expand the userbase, but the safety-first architecture applies to both.

Each section maintains its own ride pool. Women riders only see women drivers and vice versa in the women's section.

### Institution-Based Trust Circles

Beyond identity verification, Safe-Sawar introduces trust circles: groups tied to institutions like universities, offices, or neighborhoods. If you are riding with someone from your own university or workplace, there is an additional layer of social accountability.

### Live Ride Tracking

Every active ride is tracked in real time using OpenStreetMap. Riders and their emergency contacts can see the vehicle's location throughout the journey.

### Offline Emergency SOS via Bluetooth Mesh

This is the feature we are most proud of. In areas with poor cellular coverage (which is common on intercity routes in Pakistan), a traditional SOS button that relies on internet connectivity is useless.

Safe-Sawar's SOS system uses Bluetooth mesh networking. When a user triggers an emergency, their phone broadcasts the alert via Bluetooth to nearby devices, which relay it further. The alert propagates through the mesh until it reaches a device with internet connectivity, which then sends the SOS to emergency contacts and authorities.

This works even in complete dead zones. As long as there are other phones within Bluetooth range (even phones not running Safe-Sawar, if they support the protocol), the alert gets through.

## Tech Stack

- **Frontend**: React Native with Expo and TypeScript
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Maps**: OpenStreetMap integration
- **Identity**: NADRA API for biometric verification
- **Mesh Network**: Bluetooth Low Energy for offline SOS

## Architecture Decisions

**React Native + Expo** over native Swift/Kotlin because we needed to ship on both platforms simultaneously with a small team. Expo's managed workflow handled push notifications, location services, and Bluetooth without ejecting.

**Firebase** over a custom backend because real-time ride updates, presence detection, and push notifications are Firebase's core strengths. Firestore's offline persistence also means the app remains functional in poor connectivity areas.

**OpenStreetMap** over Google Maps because OSM data is better maintained in Pakistan for rural and intercity routes, and there are no per-request API costs that would make the app economically unviable at scale.

## Current Status

Safe-Sawar is currently in beta testing with university communities in Islamabad. We are refining the onboarding flow, expanding trust circle features, and preparing for a wider launch.

## Try It

The project is open source: [github.com/faizan-02/Safe-Sawar](https://github.com/faizan-02/Safe-Sawar)

If you are interested in contributing or partnering on deployment, [reach out to us](https://www.hydrabytes.tech/contact).

---

*Built by [HydraBytes](https://www.hydrabytes.tech), an Islamabad-based development agency specializing in web, mobile, and AI solutions.*
