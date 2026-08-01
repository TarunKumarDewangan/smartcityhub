import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
      await apiClient.post('/send-otp', { phone: '+91' + phone });
      setOtpCode('');
      setStep('otp');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to send verification code. Please try again.');
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
      await apiClient.post('/register', {
        name,
        email,
        phone: '+91' + phone,
        password,
        role,
        otp: otpCode,
      });

      Alert.alert('Success', 'Account created! Please login.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Registration failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('form');
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
