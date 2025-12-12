import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Check from '../../assets/svgIcons/check.svg';
import { colors, dimensions } from '../../assets/theme';

const SubscriptionCard = ({
    title = "Subscription",
    validity = "30 days",
    packageName = "Basic",
    packages = [],
    featuresList = [],
    isInitiatingPayment = false,
    onBuyNow,
    styles
}) => {
    const selectedPackage = packages.find(pkg => pkg.name === packageName);

    if (!selectedPackage) return null;

    return (
        <TouchableOpacity activeOpacity={1}>
            <View style={styles.fullpage}>
                {/* Header */}
                <View style={styles.subscriptionWrapper}>
                    <Text style={styles.durationtext}>{title}</Text>
                    <Text style={[styles.durationtext, { fontWeight: '400', fontSize: 17 }]}>
                        Validity - {validity}
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* Price */}
                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={styles.amountText}>₹ {selectedPackage.amount}</Text>
                    </View>

                    {/* Features */}
                    {featuresList.map((feature, index) => (
                        <View
                            key={index}
                            style={[
                                styles.featureRow,
                                { backgroundColor: '#F8F9FC' },
                            ]}
                        >
                            <View style={styles.iconRow}>
                                <Check width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.success} />

                            </View>
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}

                    {/* Buy Now Button */}
                    <View style={styles.column}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => onBuyNow?.(selectedPackage)}
                            disabled={isInitiatingPayment}
                        >
                            <Text style={styles.buttonText}>Buy now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default SubscriptionCard;
