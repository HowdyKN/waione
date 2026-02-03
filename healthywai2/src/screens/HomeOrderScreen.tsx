import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';

const product = {
  name: 'Family weekend veggie pack',
  tagline: 'Fresh, homemade idlis — limited drop',
  priceOneTimeCents: 2950,
  subscribeDiscountPercent: 10,
  bullets: [
    '20 soft, freshly steamed idlis',
    'Traditional batter, no preservatives',
    'Made the same morning',
  ],
  ingredients:
    'Idli rice, urad dal, salt, water (example placeholder).',
  allergens:
    'May contain traces of sesame/peanuts if prepared in shared space (placeholder).',
};

const delivery = {
  title: 'Next Delivery',
  dateText: 'Sunday, Feb 9',
  windowText: '8 AM – 10 AM',
  cutoffText: 'Order cutoff: Friday 8 PM',
};

const fees = {
  deliveryFeeCents: 99,
  taxRate: 0.0825,
};

const rating = { value: 4.8, count: 120 };

const whatsapp = {
  phoneE164NoPlus: '12145550123',
  campaign: 'drop_20260209',
};

const APP_NAME = 'HealthyWAI2';

function formatMoney(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

export default function HomeOrderScreen() {
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscription'>('one-time');
  const [cadence, setCadence] = useState<'weekly' | 'monthly'>('weekly');
  const [quantity, setQuantity] = useState(1);
  const [expandedIngredients, setExpandedIngredients] = useState(false);
  const [expandedAllergens, setExpandedAllergens] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const unitPriceCents = useMemo(() => {
    if (purchaseMode === 'one-time') return product.priceOneTimeCents;
    const discounted =
      product.priceOneTimeCents * (1 - product.subscribeDiscountPercent / 100);
    return Math.round(discounted);
  }, [purchaseMode]);

  const subtotalCents = unitPriceCents * quantity;
  const taxCents = Math.round(subtotalCents * fees.taxRate);
  const totalCents = subtotalCents + fees.deliveryFeeCents + taxCents;

  function buildWhatsAppText(): string {
    const parts = [
      `Order: ${product.name}`,
      `Delivery: ${delivery.dateText}`,
      `Qty: ${quantity}`,
      `Mode: ${purchaseMode === 'subscription' ? `Subscribe (${cadence})` : 'One-time'}`,
      `Via ${APP_NAME}`,
    ];
    return parts.join('\n');
  }

  function openWhatsAppChat() {
    const text = encodeURIComponent(buildWhatsAppText());
    const url = `https://wa.me/${whatsapp.phoneE164NoPlus}?text=${text}`;
    Linking.openURL(url);
  }

  function openWhatsAppShare() {
    const url = `https://example.com/?utm_source=whatsapp&utm_campaign=${whatsapp.campaign}&utm_content=share_button`;
    Linking.openURL(url);
  }

  function onCheckout() {
    const payload = {
      product: product.name,
      purchaseMode,
      cadence: purchaseMode === 'subscription' ? cadence : undefined,
      quantity,
      unitPriceCents,
      subtotalCents,
      deliveryFeeCents: fees.deliveryFeeCents,
      taxCents,
      totalCents,
      delivery: delivery.dateText,
    };
    console.log('Order payload:', payload);
    Alert.alert('Checkout', 'Proceeding to Stripe Checkout (stub)');
  }

  function onSwitchToSubscription() {
    setPurchaseMode('subscription');
  }

  const faqItems = [
    { q: 'How do I get my order?', a: 'We deliver to your door during the chosen window.' },
    { q: 'Can I cancel?', a: 'Yes, before the order cutoff.' },
    { q: 'Refunds?', a: 'Contact us via WhatsApp.' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 1) Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>What an Idli</Text>
          <View style={styles.topBarRight}>
            <Pressable
              style={({ pressed }) => [styles.chatBtn, pressed && styles.pressed]}
              onPress={openWhatsAppChat}
            >
              <Text style={styles.chatBtnText}>Chat</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
              onPress={openWhatsAppShare}
            >
              <Text style={styles.shareBtnText}>Share</Text>
            </Pressable>
          </View>
        </View>

        {/* 2) Hero / Product */}
        <View style={styles.hero}>
          <View style={styles.mediaPlaceholder} />
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.tagline}>{product.tagline}</Text>
          <Text style={styles.priceBig}>{formatMoney(unitPriceCents)}</Text>
          <Text style={styles.priceLabel}>per pack</Text>

          <View style={styles.modeRow}>
            <Pressable
              style={[
                styles.modeChip,
                purchaseMode === 'one-time' && styles.modeChipActive,
              ]}
              onPress={() => setPurchaseMode('one-time')}
            >
              <Text
                style={[
                  styles.modeChipText,
                  purchaseMode === 'one-time' && styles.modeChipTextActive,
                ]}
              >
                One-time
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeChip,
                purchaseMode === 'subscription' && styles.modeChipActive,
              ]}
              onPress={onSwitchToSubscription}
            >
              <Text
                style={[
                  styles.modeChipText,
                  purchaseMode === 'subscription' && styles.modeChipTextActive,
                ]}
              >
                Subscribe & save
              </Text>
            </Pressable>
          </View>

          {purchaseMode === 'subscription' && (
            <View style={styles.subBadgeRow}>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 10%</Text>
              </View>
              <View style={styles.cadenceRow}>
                <Pressable
                  style={[
                    styles.cadenceChip,
                    cadence === 'weekly' && styles.cadenceChipActive,
                  ]}
                  onPress={() => setCadence('weekly')}
                >
                  <Text
                    style={[
                      styles.cadenceChipText,
                      cadence === 'weekly' && styles.cadenceChipTextActive,
                    ]}
                  >
                    Weekly
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.cadenceChip,
                    cadence === 'monthly' && styles.cadenceChipActive,
                  ]}
                  onPress={() => setCadence('monthly')}
                >
                  <Text
                    style={[
                      styles.cadenceChipText,
                      cadence === 'monthly' && styles.cadenceChipTextActive,
                    ]}
                  >
                    Monthly
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setQuantity((q) => Math.min(12, q + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>

          <Pressable style={styles.ctaButton} onPress={onCheckout}>
            <Text style={styles.ctaButtonText}>Checkout</Text>
          </Pressable>
          <Text style={styles.securityNote}>Secure checkout via Stripe</Text>
        </View>

        {/* 3) Delivery card */}
        <View style={styles.deliveryCard}>
          <Text style={styles.deliveryTitle}>{delivery.title}</Text>
          <Text style={styles.deliveryDate}>{delivery.dateText}</Text>
          <Text style={styles.deliveryWindow}>{delivery.windowText}</Text>
          <Text style={styles.deliveryCutoff}>{delivery.cutoffText}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingValue}>{rating.value}</Text>
          <Text style={styles.ratingCount}>({rating.count})</Text>
        </View>

        {/* Bullets */}
        <View style={styles.bullets}>
          {product.bullets.map((b, i) => (
            <Text key={i} style={styles.bullet}>
              • {b}
            </Text>
          ))}
        </View>

        {/* Ingredients */}
        <Pressable
          style={styles.expandRow}
          onPress={() => setExpandedIngredients((e) => !e)}
        >
          <Text style={styles.expandTitle}>Ingredients</Text>
          <Text style={styles.expandChevron}>{expandedIngredients ? '▼' : '▶'}</Text>
        </Pressable>
        {expandedIngredients && (
          <Text style={styles.expandBody}>{product.ingredients}</Text>
        )}

        {/* Allergens */}
        <Pressable
          style={styles.expandRow}
          onPress={() => setExpandedAllergens((e) => !e)}
        >
          <Text style={styles.expandTitle}>Allergens</Text>
          <Text style={styles.expandChevron}>{expandedAllergens ? '▼' : '▶'}</Text>
        </Pressable>
        {expandedAllergens && (
          <Text style={styles.expandBody}>{product.allergens}</Text>
        )}

        {/* Order summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatMoney(subtotalCents)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>{formatMoney(fees.deliveryFeeCents)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatMoney(taxCents)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatMoney(totalCents)}</Text>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.faq}>
          <Text style={styles.faqTitle}>FAQ</Text>
          {faqItems.map((item, i) => (
            <Pressable
              key={i}
              style={styles.faqItem}
              onPress={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
            >
              <Text style={styles.faqQuestion}>{item.q}</Text>
              {openFaqIndex === i && (
                <Text style={styles.faqAnswer}>{item.a}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: { fontSize: 18, fontWeight: '700', color: '#111' },
  topBarRight: { flexDirection: 'row', gap: 8 },
  chatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#25D366',
    borderRadius: 6,
  },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e5e5e5',
    borderRadius: 6,
  },
  shareBtnText: { color: '#333', fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.8 },
  hero: { padding: 16 },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  tagline: { fontSize: 15, color: '#666', marginBottom: 12 },
  priceBig: { fontSize: 28, fontWeight: '800', color: '#111' },
  priceLabel: { fontSize: 14, color: '#666', marginBottom: 16 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  modeChipActive: { backgroundColor: '#111' },
  modeChipText: { fontSize: 14, fontWeight: '600', color: '#333' },
  modeChipTextActive: { color: '#fff' },
  subBadgeRow: { marginBottom: 12 },
  saveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  saveBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cadenceRow: { flexDirection: 'row', gap: 8 },
  cadenceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  cadenceChipActive: { backgroundColor: '#333' },
  cadenceChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  cadenceChipTextActive: { color: '#fff' },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: { fontSize: 20, fontWeight: '600', color: '#111' },
  quantityText: { fontSize: 18, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  ctaButton: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  securityNote: { fontSize: 12, color: '#888', textAlign: 'center' },
  deliveryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  deliveryTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  deliveryDate: { fontSize: 15, color: '#333' },
  deliveryWindow: { fontSize: 14, color: '#666', marginTop: 2 },
  deliveryCutoff: { fontSize: 13, color: '#888', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, gap: 4 },
  ratingValue: { fontSize: 15, fontWeight: '700', color: '#111' },
  ratingCount: { fontSize: 14, color: '#666' },
  bullets: { paddingHorizontal: 16, marginTop: 12 },
  bullet: { fontSize: 14, color: '#444', marginBottom: 4 },
  expandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  expandTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  expandChevron: { fontSize: 12, color: '#666' },
  expandBody: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    fontSize: 14,
    color: '#555',
  },
  summary: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#111' },
  summaryTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' },
  summaryTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
  summaryTotalValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  faq: { marginHorizontal: 16, marginTop: 24 },
  faqTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  faqItem: { marginBottom: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#111' },
  faqAnswer: { fontSize: 13, color: '#555', marginTop: 6 },
});
