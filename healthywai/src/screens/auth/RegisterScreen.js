import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Validate form data
   * @returns {boolean} True if valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle registration form submission
   */
  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        ...(formData.phone?.trim() && { phone: formData.phone.trim() })
      };
      
      // Call registration API
      const result = await register(registrationData);
      
      if (result.success) {
        // Registration successful - user is automatically logged in
        // Navigation will happen automatically via AuthContext
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK' }
        ]);
      } else {
        // Registration failed - show error
        let errorMessage = result.message || 'Registration failed. Please try again.';
        
        // If there are validation errors from server, format them
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          const serverErrors = result.errors
            .map(err => {
              if (typeof err === 'string') return err;
              return err.message || err.msg || `${err.param || 'Field'}: ${err.msg || err.message || 'Invalid'}`;
            })
            .join('\n');
          
          errorMessage = serverErrors || errorMessage;
        }
        
        Alert.alert('Registration Failed', errorMessage);
      }
    } catch (error) {
      // Unexpected error
      console.error('Registration error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again later.';
      Alert.alert(
        'Registration Failed',
        `Registration failed: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update form field
   */
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up for HealthyWAI</Text>

        {/* First Name */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="First Name *"
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            autoCapitalize="words"
            editable={!loading}
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Last Name *"
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            autoCapitalize="words"
            editable={!loading}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Phone */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Phone (optional)"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
            editable={!loading}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password *"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputError: {
    borderColor: '#ff3b30'
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14
  }
});
