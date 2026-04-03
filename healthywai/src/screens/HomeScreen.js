import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Safety check for user object
  const userName = user?.firstName || 'Guest';

  // Calculate next Saturday
  const getNextSaturday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // Next Saturday (or today if Saturday)
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    return nextSaturday;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const nextSaturday = getNextSaturday();
  const deliveryDate = formatDate(nextSaturday);

  const handleOrderNow = () => {
    router.push('/order/confirm');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {user ? `Hello, ${userName}!` : 'Welcome to HealthyWAI'}
          </Text>
          <Text style={styles.tagline}>Fresh, Healthy Meals Delivered</Text>
        </View>

      <View style={styles.familyPackCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.packTitle}>Family Pack</Text>
          <Text style={styles.packSubtitle}>Perfect for the Whole Family</Text>
        </View>

        <View style={styles.packContent}>
          <Text style={styles.contentTitle}>What's Included:</Text>
          
          <View style={styles.itemList}>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Fresh organic fruits & vegetables</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Whole grain breakfast items</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Protein-rich options (eggs, yogurt, lean meats)</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Healthy beverages & snacks</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>Portions for 4-6 people</Text>
            </View>
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Delivery:</Text>
            <Text style={styles.deliveryText}>{deliveryDate} - Morning</Text>
            <Text style={styles.deliveryNote}>Door delivery between 7:00 AM - 10:00 AM</Text>
          </View>
        </View>

        {user ? (
          <TouchableOpacity 
            style={styles.orderButton} 
            onPress={handleOrderNow}
            activeOpacity={0.8}
          >
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center'
  },
  tagline: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center'
  },
  familyPackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20
  },
  cardHeader: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 16
  },
  packTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  packSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  packContent: {
    marginBottom: 24
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16
  },
  itemList: {
    marginBottom: 20
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start'
  },
  bullet: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold'
  },
  itemText: {
    fontSize: 16,
    color: '#34495e',
    flex: 1,
    lineHeight: 24
  },
  deliveryInfo: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginTop: 8
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  deliveryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4
  },
  deliveryNote: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  orderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  authButtonsContainer: {
    gap: 12
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  signUpButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  signUpButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});


