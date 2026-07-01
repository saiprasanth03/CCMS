const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  'pages/About.jsx': [
    { from: "import { motion } from 'framer-motion';", to: "import { motion } from 'framer-motion';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const About = () => {", to: "const About = () => {\n  const { t } = useLanguage();" },
    { from: "Our Story & Vision", to: "{t('about.storyTitle')}" },
    { from: "The Community Complaint Management System (CCMS) was built to redefine civic engagement, bringing transparency, accountability, and speed to public administration.", to: "{t('about.storyDesc')}" },
    { from: ">Our Mission<", to: ">{t('about.missionTitle')}<" },
    { from: "To bridge the gap between citizens and the government by providing a transparent, efficient, and highly accessible platform for reporting public issues. We believe that a responsive government starts with giving citizens a clear, powerful voice.", to: "{t('about.missionDesc')}" },
    { from: ">Our Vision<", to: ">{t('about.visionTitle')}<" },
    { from: "A future where no community issue goes unnoticed. We envision a digital-first civic ecosystem where artificial intelligence and automated jurisdiction routing eliminate bureaucratic delays and ensure every problem is solved by the right authority at the right time.", to: "{t('about.visionDesc')}" },
    { from: "Core Principles", to: "{t('about.principlesTitle')}" },
    { from: "The foundational values that drive the CCMS architecture.", to: "{t('about.principlesDesc')}" },
    { from: ">Secure<", to: ">{t('about.secureTitle')}<" },
    { from: "Bank-level encryption for all citizen data and verifiable admin OTP logins.", to: "{t('about.secureDesc')}" },
    { from: "Fast Resolution", to: "{t('about.fastTitle')}" },
    { from: "Strict SLA timelines enforcing quick action from assigned officers.", to: "{t('about.fastDesc')}" },
    { from: "Community Driven", to: "{t('about.communityTitle')}" },
    { from: "Built for the people, prioritizing public welfare and infrastructural safety.", to: "{t('about.communityDesc')}" },
    { from: "Accessible", to: "{t('about.accessibleTitle')}" },
    { from: "Available on all devices, anywhere, anytime, ensuring nobody is left behind.", to: "{t('about.accessibleDesc')}" },
    { from: "Developer Portal", to: "{t('about.devPortalTitle')}" },
    { from: "As a developer or superadmin, your insights help shape the CCMS platform. Have suggestions for new features or bug reports?", to: "{t('about.devPortalDesc')}" },
    { from: "Developer Feedback", to: "{t('about.feedbackTitle')}" },
    { from: ">Submit Platform Feedback<", to: ">{t('about.submitFeedback')}<" },
    { from: "Feedback Received!", to: "{t('about.feedbackReceived')}" },
    { from: "Thank you for helping us improve CCMS. Your submission has been securely logged.", to: "{t('about.feedbackThanks')}" },
    { from: ">Feedback Type<", to: ">{t('about.feedbackType')}<" },
    { from: ">Message<", to: ">{t('about.feedbackMessage')}<" },
    { from: "Feature Request", to: "{t('about.featureRequest')}" },
    { from: "Bug Report", to: "{t('about.bugReport')}" },
    { from: ">Other<", to: ">{t('about.otherType')}<" },
    { from: 'placeholder="Describe the bug or feature idea in detail..."', to: 'placeholder={t("about.feedbackPlaceholder")}' },
    { from: ">Close<", to: ">{t('about.close')}<" },
    { from: ">Cancel<", to: ">{t('about.cancel')}<" },
    { from: "Submit Feedback", to: "{t('about.submitBtn')}" },
    { from: "Submitting...", to: "{t('about.submitting')}" },
    { from: "'Failed to submit feedback'", to: "t('about.feedbackFailed')" },
  ],
  'pages/LandingPage.jsx': [
    { from: "import { ArrowRight, ShieldAlert, Zap, MapPin, Activity, CheckCircle, ChevronRight } from 'lucide-react';", to: "import { ArrowRight, ShieldAlert, Zap, MapPin, Activity, CheckCircle, ChevronRight } from 'lucide-react';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const LandingPage = () => {", to: "const LandingPage = () => {\n  const { t } = useLanguage();" },
    { from: "Next-Gen Civic Management System", to: "{t('landing.badge')}" },
    { from: "Bridging the gap between Citizens & Government", to: "{t('landing.heroTitle')}" },
    { from: "Report infrastructural issues, track real-time resolution, and hold local authorities accountable through our automated hierarchical escalation matrix.", to: "{t('landing.heroDesc')}" },
    { from: "Report an Issue", to: "{t('landing.reportBtn')}" },
    { from: "Track Complaint", to: "{t('landing.trackBtn')}" },
    { from: ">Built for Transparency<", to: ">{t('landing.featureTitle')}<" },
    { from: "Everything you need to track civic improvements in your neighborhood.", to: "{t('landing.featureDesc')}" },
    { from: "It takes less than 2 minutes to report a civic issue and trigger a government response.", to: "{t('landing.featureRegister')}" },
    { from: ">Geo-Tagged Evidence<", to: ">{t('landing.geoTitle')}<" },
    { from: "Upload photos with strict location data so authorities know exactly where the problem is located, reducing survey times.", to: "{t('landing.geoDesc')}" },
    { from: ">Live Status Tracking<", to: ">{t('landing.liveTitle')}<" },
    { from: "No more black boxes. Track your complaint status from \"Received\" to \"In Progress\" to \"Resolved\" with timestamps.", to: "{t('landing.liveDesc')}" },
    { from: ">Data Analytics<", to: ">{t('landing.dataTitle')}<" },
    { from: "Public dashboards allow citizens to view resolution rates for different mandals and districts, promoting healthy competition.", to: "{t('landing.dataDesc')}" },
    { from: "Our Unique Feature", to: "{t('landing.escalationTitle')}" },
    { from: "Automated Hierarchical Escalation", to: "{t('landing.escalationSubtitle')}" },
    { from: "Unlike generic complaint portals that dump all tickets into a single massive queue, CCMS uses a smart jurisdiction router.", to: "{t('landing.escalationDesc')}" },
    { from: "Pinpoint Routing:", to: "{t('landing.pinpoint')}" },
    { from: "Complaints are instantly assigned to the specific Village or Ward Officer.", to: "{t('landing.pinpointDesc')}" },
    { from: "Time-Bound Action:", to: "{t('landing.timeBound')}" },
    { from: "If an issue isn't resolved within the SLA (Service Level Agreement) timeframe...", to: "{t('landing.timeBoundDesc')}" },
    { from: "Automatic Escalation:", to: "{t('landing.autoEscalation')}" },
    { from: "It automatically escalates to Mandal, then District, and finally State-level Superadmins.", to: "{t('landing.autoEscalationDesc')}" },
    { from: "State Admin (Highest)", to: "{t('landing.stateAdmin')}" },
    { from: "Views unresolved critical escalations", to: "{t('landing.stateAdminDesc')}" },
    { from: "District Collector", to: "{t('landing.districtCollector')}" },
    { from: "Escalated after 14 days", to: "{t('landing.districtCollectorDesc')}" },
    { from: "Mandal Officer", to: "{t('landing.mandalOfficer')}" },
    { from: "Escalated after 7 days", to: "{t('landing.mandalOfficerDesc')}" },
    { from: "Village Authority (Direct)", to: "{t('landing.villageAuth')}" },
    { from: "Immediate assignment upon submission", to: "{t('landing.villageAuthDesc')}" },
    { from: "Ready to make a difference?", to: "{t('landing.ctaTitle')}" },
    { from: "Register a Complaint Now", to: "{t('landing.ctaBtn')}" },
  ]
};

async function run() {
  for (const [file, reps] of Object.entries(replacements)) {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    for (const {from, to} of reps) {
      content = content.replace(from, to);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

run();
