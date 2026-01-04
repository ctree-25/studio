# CourtConnect

CourtConnect is a web application designed to connect high school volleyball players with experienced coaches for skill assessment and mentorship. Players can create a profile and upload highlight videos, and coaches can provide detailed feedback, including skill ratings and qualitative assessments. The platform also leverages AI to generate personalized training plans based on coach feedback.

## User Journeys

### Player Journey
1.  **Sign Up/Log In**: Players sign up or log in to the application using their Google account and select the "Player" role.
2.  **Create/Edit Profile**: Players complete a detailed profile including:
    *   Personal information (name, height, graduation year).
    *   Volleyball specifics (position, target level of play).
    *   A link to a YouTube highlight video.
    *   A profile picture.
3.  **Submit Profile**: Once the profile is complete, the player submits it for review by coaches.
4.  **View Feedback Dashboard**: After coaches have reviewed the profile, the player can access a comprehensive feedback dashboard that includes:
    *   An overall readiness score for their targeted level of play.
    *   Average skill ratings across multiple assessments.
    *   A spider chart visualizing ratings from individual coaches.
    *   Qualitative feedback from each coach.
    *   An AI-generated, personalized training plan with actionable drills and links to relevant YouTube training videos.

### Coach Journey
1.  **Sign Up/Log In**: Coaches sign up or log in using their Google account and select the "Coach" role.
2.  **Create Profile**: First-time coaches create a profile detailing their coaching experience, affiliation, and the number of profiles they are willing to review.
3.  **Review Players**: Coaches are presented with a dashboard of submitted player profiles awaiting evaluation.
4.  **Provide Assessment**: The coach selects a player, reviews their profile information and highlight video, and then provides an assessment including:
    *   Numerical ratings (1-10) for position-specific skills.
    *   Constructive, written feedback.
5.  **Submit Feedback**: The coach submits the assessment, which then becomes available to the player.

## Technical Overview

*   **Frontend**: Next.js, React, TypeScript, Tailwind CSS, ShadCN UI
*   **Backend**: Firebase (Authentication, Firestore, Storage)
*   **Generative AI**: Google AI (Genkit) is used to generate personalized training plans for players based on the aggregated feedback from coaches.
