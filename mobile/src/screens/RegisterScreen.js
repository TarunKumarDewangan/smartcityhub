import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import apiClient from '../api/client';
import PhoneInput from '../components/PhoneInput';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';
import { User, Mail, Lock } from 'lucide-react-native';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const { theme } = useTheme();

  // OTP verification step: 'form' -> 'otp'
  const [step, setStep] = useState('form');
  const [confirmation, setConfirmation] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = async () => {
    if (!name || !email || !password || !phone) {
        Alert.alert('Error', 'Please fill all fields');
        return;
    }

    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setSendingOtp(true);
    try {
      const result = await auth().signInWithPhoneNumber('+91' + phone);
      setConfirmation(result);
      setOtpCode('');
      setStep('otp');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code sent to your phone.');
      return;
    }

    setVerifying(true);
    try {
      const userCredential = await confirmation.confirm(otpCode);
      const firebaseIdToken = await userCredential.user.getIdToken();

      await apiClient.post('/register', {
        name,
        email,
        phone: '+91' + phone,
        password,
        role,
        firebase_id_token: firebaseIdToken,
      });

      // The app authenticates via its own Sanctum token; Firebase was only
      // needed to prove phone ownership. Best-effort cleanup — must never
      // turn an already-successful registration into a reported failure.
      try {
        await auth().signOut();
      } catch (signOutError) {
        console.warn('Firebase sign-out after registration failed (non-critical):', signOutError);
      }

      Alert.alert('Success', 'Account created! Please login.');
      navigation.navigate('Login');
    } catch (e) {
      if (e.code === 'auth/invalid-verification-code') {
        Alert.alert('Error', 'Incorrect code. Please check and try again.');
      } else if (e.code === 'auth/code-expired') {
        Alert.alert('Error', 'This code has expired. Please resend a new one.');
      } else {
        Alert.alert('Error', e.response?.data?.message || e.message || 'Registration failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('form');
    setConfirmation(null);
    setOtpCode('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.primary }]}>Register</Text>

        {step === 'form' ? (
          <>
            <InputField
              label="Full Name"
              icon={User}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <InputField
              label="Email"
              icon={Mail}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              label="Phone Number *"
            />

            <InputField
              label="Password"
              icon={Lock}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={[styles.label, { color: theme.text }]}>Register as:</Text>
            <View style={styles.roleContainer}>
              {['User', 'ShopOwner', 'ServiceProvider'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleButton,
                    { borderColor: theme.primary },
                    role === r && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[
                    styles.roleText,
                    { color: theme.primary },
                    role === r && { color: '#fff' }
                  ]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, sendingOtp && styles.disabledButton]}
              onPress={handleSendOtp}
              disabled={sendingOtp}
            >
              <Text style={styles.buttonText}>{sendingOtp ? 'Sending Code...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: theme.primary }]}>Already have an account? Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.otpHint, { color: theme.secondaryText }]}>
              Enter the 6-digit code sent to +91 {phone}
            </Text>

            <InputField
              label="Verification Code"
              icon={Lock}
              placeholder="6-digit code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, verifying && styles.disabledButton]}
              onPress={handleVerifyOtp}
              disabled={verifying}
            >
              <Text style={styles.buttonText}>{verifying ? 'Verifying...' : 'Verify & Create Account'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSendOtp} disabled={sendingOtp}>
              <Text style={[styles.link, { color: theme.primary }]}>{sendingOtp ? 'Resending...' : 'Resend Code'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChangeNumber}>
              <Text style={[styles.link, { color: theme.secondaryText }]}>Change Phone Number</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center' },
  otpHint: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleButton: { padding: 10, borderRadius: 5, borderWidth: 1, flex: 1, marginHorizontal: 2, alignItems: 'center' },
  roleText: { fontSize: 12 }
});

export default RegisterScreen;
