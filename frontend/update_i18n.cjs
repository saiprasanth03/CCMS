const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  'pages/Register.jsx': [
    { from: "import { AuthContext } from '../context/AuthContext';", to: "import { AuthContext } from '../context/AuthContext';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const Register = () => {", to: "const Register = () => {\n  const { t } = useLanguage();" },
    { from: "Create an Account", to: "{t('register.title')}" },
    { from: "Join CCMS to report and track community issues", to: "{t('register.subtitle')}" },
    { from: "Full Name", to: "{t('register.fullName')}" },
    { from: 'placeholder="John Doe"', to: 'placeholder={t("register.fullNamePlaceholder")}' },
    { from: "Email Address", to: "{t('register.email')}" },
    { from: 'placeholder="you@example.com"', to: 'placeholder={t("register.emailPlaceholder")}' },
    { from: "Phone Number", to: "{t('register.phone')}" },
    { from: 'placeholder="+91 98765 43210"', to: 'placeholder={t("register.phonePlaceholder")}' },
    { from: "Password", to: "{t('register.password')}" },
    { from: 'placeholder="••••••••"', to: 'placeholder="••••••••"' }, // keep password dots
    { from: "Full Address", to: "{t('register.address')}" },
    { from: 'placeholder="123 Main St, City, State, Zip"', to: 'placeholder={t("register.addressPlaceholder")}' },
    { from: "I agree to the", to: "{t('register.agree')}" },
    { from: "Terms & Conditions", to: "{t('register.terms')}" },
    { from: "and", to: "{t('register.and')}" },
    { from: "Privacy Policy", to: "{t('register.privacy')}" },
    { from: ">Create Account<", to: ">{t('register.createAccount')}<" },
    { from: "Already have an account?", to: "{t('register.alreadyHave')}" },
    { from: ">Sign In<", to: ">{t('register.signIn')}<" },
    { from: "'Registration failed. Please try again.'", to: "t('register.registerFailed')" },
  ],
  'pages/ForgotPassword.jsx': [
    { from: "import { AuthContext } from '../context/AuthContext';", to: "import { AuthContext } from '../context/AuthContext';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const ForgotPassword = () => {", to: "const ForgotPassword = () => {\n  const { t } = useLanguage();" },
    { from: "Forgot Password", to: "{t('forgot.title')}" },
    { from: "Enter your registered email address and we'll send you an OTP to reset your password.", to: "{t('forgot.desc')}" },
    { from: "Official Email Address", to: "{t('forgot.emailLabel')}" },
    { from: 'placeholder="name@gmail.com"', to: 'placeholder={t("forgot.emailPlaceholder")}' },
    { from: "OTP Sent Successfully!", to: "{t('forgot.otpSuccess')}" },
    { from: "Check your email (or terminal log in dev mode). Redirecting...", to: "{t('forgot.otpSuccessDesc')}" },
    { from: "Send Reset OTP", to: "{t('forgot.sendOTP')}" },
    { from: "Sending OTP...", to: "{t('forgot.sendingOTP')}" },
    { from: "Return to login", to: "{t('forgot.returnLogin')}" },
    { from: "'Failed to send OTP. Please try again.'", to: "t('forgot.otpFailed')" }
  ],
  'pages/ResetPassword.jsx': [
    { from: "import { Link, useNavigate, useLocation } from 'react-router-dom';", to: "import { Link, useNavigate, useLocation } from 'react-router-dom';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const ResetPassword = () => {", to: "const ResetPassword = () => {\n  const { t } = useLanguage();" },
    { from: "Reset Password", to: "{t('reset.title')}" },
    { from: "Enter the 6-digit OTP sent to your email and choose a new password.", to: "{t('reset.desc')}" },
    { from: "Email Address", to: "{t('reset.emailLabel')}" },
    { from: 'placeholder="Enter your email"', to: 'placeholder={t("reset.emailPlaceholder")}' },
    { from: "6-Digit OTP", to: "{t('reset.otpLabel')}" },
    { from: 'placeholder="------"', to: 'placeholder={t("reset.otpPlaceholder")}' },
    { from: "New Password", to: "{t('reset.newPassword')}" },
    { from: "Confirm New Password", to: "{t('reset.confirmPassword')}" },
    { from: "Password Reset Successful!", to: "{t('reset.resetSuccess')}" },
    { from: "You will be redirected to the login page momentarily.", to: "{t('reset.resetSuccessDesc')}" },
    { from: ">Reset Password<", to: ">{t('reset.resetBtn')}<" },
    { from: ">Resetting Password...<", to: ">{t('reset.resetting')}<" },
    { from: "Return to login", to: "{t('reset.returnLogin')}" },
    { from: "'Passwords do not match'", to: "t('reset.passwordMismatch')" },
    { from: "'Invalid OTP or expired token.'", to: "t('reset.resetFailed')" },
  ],
  'pages/NotFound.jsx': [
    { from: "import { Link } from 'react-router-dom';", to: "import { Link } from 'react-router-dom';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const NotFound = () => {", to: "const NotFound = () => {\n  const { t } = useLanguage();" },
    { from: "404", to: "{t('notFound.title')}" },
    { from: "Oops! The page you are looking for does not exist.", to: "{t('notFound.desc')}" },
    { from: "Go Back Home", to: "{t('notFound.goHome')}" },
  ],
  'pages/TrackComplaints.jsx': [
    { from: "import { Search, Filter, ShieldAlert, Clock, CheckCircle, XCircle } from 'lucide-react';", to: "import { Search, Filter, ShieldAlert, Clock, CheckCircle, XCircle } from 'lucide-react';\nimport { useLanguage } from '../context/LanguageContext';" },
    { from: "const TrackComplaints = () => {", to: "const TrackComplaints = () => {\n  const { t } = useLanguage();" },
    { from: "Track Public Complaints", to: "{t('track.title')}" },
    { from: "Search and track community issues in real-time", to: "{t('track.subtitle')}" },
    { from: 'placeholder="Search ID, Title, Category..."', to: 'placeholder={t("track.searchPlaceholder")}' },
    { from: "No complaints found.", to: "{t('track.noComplaints')}" },
    { from: "Priority:", to: "{t('track.priority')}" },
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
