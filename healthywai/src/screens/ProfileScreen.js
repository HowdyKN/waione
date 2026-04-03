import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, updateProfileAddress } = useAuth();
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAddressLine1(user.addressLine1 || '');
    setAddressLine2(user.addressLine2 || '');
    setCity(user.city || '');
    setState(user.state || '');
    setPostalCode(user.postalCode || '');
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const saveDefaultAddress = useCallback(async () => {
    if (!addressLine1.trim() || !city.trim()) {
      Alert.alert('Default address', 'Address line 1 and city are required.');
      return;
    }
    try {
      setSavingAddress(true);
      const res = await updateProfileAddress({
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: 'US'
      });
      if (res?.success) {
        Alert.alert('Saved', 'Your default delivery address has been updated.');
      } else {
        Alert.alert('Could not save', res?.message || 'Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save address.');
    } finally {
      setSavingAddress(false);
    }
  }, [
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    updateProfileAddress
  ]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>First Name:</Text>
          <Text style={styles.infoValue}>{user?.firstName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Name:</Text>
          <Text style={styles.infoValue}>{user?.lastName}</Text>
        </View>
        {user?.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        )}
        {user?.customerNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer ID:</Text>
            <Text style={styles.infoValue}>{user.customerNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.addressSection}>
        <Text style={styles.addressSectionTitle}>Default delivery address</Text>
        <Text style={styles.addressHint}>
          Used to pre-fill orders. You can change it anytime here or when you check out.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Address line 1 *"
          value={addressLine1}
          onChangeText={setAddressLine1}
        />
        <TextInput
          style={styles.input}
          placeholder="Address line 2"
          value={addressLine2}
          onChangeText={setAddressLine2}
        />
        <TextInput
          style={styles.input}
          placeholder="City *"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="State"
          value={state}
          onChangeText={setState}
        />
        <TextInput
          style={styles.input}
          placeholder="Postal code"
          value={postalCode}
          onChangeText={setPostalCode}
        />
        <TouchableOpacity
          style={[styles.saveAddressBtn, savingAddress && styles.btnDisabled]}
          onPress={saveDefaultAddress}
          disabled={savingAddress}
        >
          {savingAddress ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveAddressBtnText}>Save default address</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff'
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4
  },
  email: {
    fontSize: 16,
    color: '#666'
  },
  infoSection: {
    marginTop: 24
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  addressSection: {
    marginTop: 28,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  addressSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  addressHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14,
    lineHeight: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  saveAddressBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 6
  },
  btnDisabled: {
    opacity: 0.7
  },
  saveAddressBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  infoLabel: {
    fontSize: 16,
    color: '#666'
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  logoutButton: {
    marginTop: 28,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
