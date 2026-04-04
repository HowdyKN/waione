import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import {
  getNextSaturdayDateOnly,
  getUpcomingSaturdayOptions,
  formatDeliveryLabel,
  parseSaturdayDeliveryParam,
  normalizeDeliveryDateParam,
  toDeliveryDatePayload,
  deliveryDateFromSegments,
  UPCOMING_SATURDAY_SLOT_COUNT
} from '../utils/deliveryDates';

/**
 * Post-checkout copy (same on web and native). Delivery is on a future Saturday—set expectations here.
 */
const ORDER_SUCCESS_COPY = {
  headline: "We've got your order",
  weekendLine: "Your weekend meals are covered—it's on us.",
  discoveryLine:
    'We waive your first discovery delivery on us—so you can try HealthyWAI with confidence.',
  thanksLine: 'Thank you for making a good choice.'
};

export default function OrderConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const segments = useSegments();
  const { apiClient, user, updateProfileAddress } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  /** Dynamic route [deliveryDate] + segment fallback when params lag (web). */
  const paramDelivery = useMemo(() => {
    const fromParams = normalizeDeliveryDateParam(params.deliveryDate);
    if (fromParams) return fromParams;
    return deliveryDateFromSegments(segments);
  }, [params.deliveryDate, segments]);

  const saturdayChoices = useMemo(
    () => getUpcomingSaturdayOptions(UPCOMING_SATURDAY_SLOT_COUNT),
    []
  );

  const [deliveryDate, setDeliveryDate] = useState(() => {
    const parsed = parseSaturdayDeliveryParam(paramDelivery);
    return parsed ?? getNextSaturdayDateOnly();
  });

  useEffect(() => {
    const parsed = parseSaturdayDeliveryParam(paramDelivery);
    if (parsed) setDeliveryDate(parsed);
  }, [paramDelivery]);
  const [notes, setNotes] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState(null);
  const [placedSuccess, setPlacedSuccess] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.orders.listProducts();
      if (res?.success && res?.data?.products?.length) {
        setProducts(res.data.products);
        setProductId(res.data.products[0].id);
      } else {
        setError('No products available.');
      }
    } catch (e) {
      setError(e.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!user) return;
    if (user.addressLine1) setAddressLine1(user.addressLine1);
    if (user.addressLine2) setAddressLine2(user.addressLine2);
    if (user.city) setCity(user.city);
    if (user.state) setState(user.state);
    if (user.postalCode) setPostalCode(user.postalCode);
  }, [user]);

  const selected = products.find((p) => p.id === productId);
  const lineTotalCents = selected ? selected.priceCents * quantity : 0;

  const handleSubmit = async () => {
    if (!productId || quantity < 1) {
      setError('Please select a product and quantity.');
      return;
    }
    if (!addressLine1.trim() || !city.trim()) {
      setError('Please enter address line 1 and city.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const deliveryDatePayload = toDeliveryDatePayload(deliveryDate);
      if (!deliveryDatePayload) {
        setError('Please choose a delivery Saturday.');
        setSubmitting(false);
        return;
      }
      const res = await apiClient.orders.createOrder({
        items: [{ productId, quantity }],
        deliveryDate: deliveryDatePayload,
        deliveryWindow: 'Morning - 7:00 AM - 10:00 AM',
        notes: notes.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: 'US'
      });
      if (res?.success) {
        try {
          await updateProfileAddress({
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim() || undefined,
            city: city.trim(),
            state: state.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            country: 'US'
          });
        } catch (profileErr) {
          console.warn('[OrderConfirm] Profile address save failed:', profileErr?.message);
        }
        setPlacedSuccess(true);
      } else {
        setError(res?.message || 'Order failed.');
      }
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        'Could not place order. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (placedSuccess) {
    const scheduledLabel = formatDeliveryLabel(deliveryDate);
    return (
      <ScrollView
        style={styles.successScroll}
        contentContainerStyle={styles.successScrollContent}
      >
        <View style={styles.successInner}>
          <View style={styles.iconRing} accessibilityLabel="Order received">
            <Text style={styles.iconCheck}>✓</Text>
          </View>
          <Text style={styles.successHeadline}>{ORDER_SUCCESS_COPY.headline}</Text>
          <Text style={styles.successBody}>{ORDER_SUCCESS_COPY.weekendLine}</Text>
          <Text style={styles.successBody}>{ORDER_SUCCESS_COPY.discoveryLine}</Text>
          <Text style={styles.successSchedule}>
            Your delivery is scheduled for{' '}
            <Text style={styles.successScheduleEm}>{scheduledLabel}</Text> in your chosen morning
            window—we will see you then.
          </Text>
          <Text style={styles.successThanks}>{ORDER_SUCCESS_COPY.thanksLine}</Text>
          <TouchableOpacity
            style={styles.submit}
            onPress={() => router.replace('/(tabs)/orders')}
          >
            <Text style={styles.submitText}>View your orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Confirm your order</Text>
      {selected && (
        <View style={styles.card}>
          <Text style={styles.productName}>{selected.name}</Text>
          {selected.description ? (
            <Text style={styles.desc}>{selected.description}</Text>
          ) : null}
          <Text style={styles.price}>
            ${(selected.priceCents / 100).toFixed(2)} each
          </Text>
          <View style={styles.qtyRow}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepTxt}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.total}>
            Estimated total: ${(lineTotalCents / 100).toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery</Text>
        <Text style={styles.deliveryHint}>
          Saturday morning windows. You can switch to the next available Saturdays.
        </Text>
        <View style={styles.dateChips}>
          {saturdayChoices.map(({ iso }) => {
            const selected = iso === deliveryDate;
            return (
              <TouchableOpacity
                key={iso}
                style={[styles.dateChip, selected && styles.dateChipSelected]}
                onPress={() => setDeliveryDate(iso)}
                activeOpacity={0.85}
              >
                <Text style={[styles.dateChipText, selected && styles.dateChipTextSelected]}>
                  {formatDeliveryLabel(iso)}
                </Text>
                <Text style={[styles.dateChipSub, selected && styles.dateChipSubSelected]}>
                  Morning 7–10 AM
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.deliveryLine}>
          {formatDeliveryLabel(deliveryDate)} — Morning (7:00 AM – 10:00 AM)
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <Text style={styles.addressHint}>
          {user?.addressLine1 && user?.city
            ? 'Pre-filled from your default profile address. Edits here still save as your default when you place the order.'
            : 'This address will be saved as your default delivery address on your profile when you place the order.'}
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Allergies, gate code, etc."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.submit, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Place order</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { marginTop: 8, color: '#666' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  productName: { fontSize: 18, fontWeight: '600' },
  desc: { color: '#666', marginTop: 8 },
  price: { marginTop: 8, color: '#333' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12
  },
  label: { fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepTxt: { color: '#fff', fontSize: 18, fontWeight: '600' },
  qtyVal: { marginHorizontal: 16, fontSize: 18, fontWeight: '600' },
  total: { marginTop: 12, fontWeight: '600' },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  deliveryHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18
  },
  dateChips: { gap: 10, marginBottom: 12 },
  dateChip: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa'
  },
  dateChipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd'
  },
  dateChipText: { fontSize: 15, fontWeight: '600', color: '#333' },
  dateChipTextSelected: { color: '#0d47a1' },
  dateChipSub: { fontSize: 12, color: '#888', marginTop: 2 },
  dateChipSubSelected: { color: '#1565c0' },
  addressHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18
  },
  deliveryLine: { color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16
  },
  notes: { minHeight: 80, textAlignVertical: Platform.OS === 'android' ? 'top' : 'auto' },
  error: { color: '#b00020', marginBottom: 12 },
  submit: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel: { marginTop: 12, alignItems: 'center', padding: 8 },
  cancelText: { color: '#007AFF' },
  successScroll: { flex: 1, backgroundColor: '#f8faf8' },
  successScrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'center'
  },
  successInner: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center'
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e8f5e9',
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  iconCheck: {
    fontSize: 36,
    color: '#2e7d32',
    fontWeight: '700'
  },
  successHeadline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 16
  },
  successBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 14
  },
  successSchedule: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 4
  },
  successScheduleEm: {
    fontWeight: '700',
    color: '#1b5e20'
  },
  successThanks: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 28
  }
});
