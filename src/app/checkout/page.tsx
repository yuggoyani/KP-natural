"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Gift,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { SearchableSelect } from "@/components/checkout/SearchableSelect";
import { useCart } from "@/context/CartContext";
import { GUJARAT_LOCATIONS } from "@/lib/locationService";
import { CustomerDetails, DeliveryAddress, CheckoutData } from "@/types/checkout";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    totalAmount,
    totalFreeCocopeat,
    totalWeightKg,
    isHydrated,
  } = useCart();

  // Form State
  const [formData, setFormData] = useState<{
    firstName: string;
    middleName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    state: "Gujarat";
    districtOrCity: string;
    villageOrArea: string;
    pinCode: string;
  }>({
    firstName: "",
    middleName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    state: "Gujarat",
    districtOrCity: "",
    villageOrArea: "",
    pinCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore saved checkout data from localStorage if available
  useEffect(() => {
    try {
      const savedCheckout = localStorage.getItem("kp_checkout_data");
      if (savedCheckout) {
        const parsed: CheckoutData = JSON.parse(savedCheckout);
        if (parsed.customerDetails && parsed.deliveryAddress) {
          setFormData({
            firstName: parsed.customerDetails.firstName || "",
            middleName: parsed.customerDetails.middleName || "",
            lastName: parsed.customerDetails.lastName || "",
            mobileNumber: parsed.customerDetails.mobileNumber || "",
            email: parsed.customerDetails.email || "",
            addressLine1: parsed.deliveryAddress.addressLine1 || "",
            addressLine2: parsed.deliveryAddress.addressLine2 || "",
            state: "Gujarat",
            districtOrCity: parsed.deliveryAddress.districtOrCity || "",
            villageOrArea: parsed.deliveryAddress.villageOrArea || "",
            pinCode: parsed.deliveryAddress.pinCode || "",
          });
        }
      }
    } catch {
      // Ignore read error
    }
  }, []);

  // District options
  const districtOptions = GUJARAT_LOCATIONS.map((loc) => ({
    value: loc.district,
    label: loc.district,
  }));

  // Area options based on selected district
  const selectedDistrictData = GUJARAT_LOCATIONS.find(
    (loc) => loc.district === formData.districtOrCity
  );

  const areaOptions = selectedDistrictData
    ? selectedDistrictData.areas.map((area) => ({
        value: area.name,
        label: area.name,
        sublabel: `PIN: ${area.pinCode}`,
      }))
    : [];

  // Handlers for dynamic location selection
  const handleDistrictChange = (district: string) => {
    setFormData((prev) => ({
      ...prev,
      districtOrCity: district,
      villageOrArea: "",
      pinCode: "",
    }));
    if (errors.districtOrCity) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.districtOrCity;
        return newErr;
      });
    }
  };

  const handleAreaChange = (areaName: string) => {
    const areaData = selectedDistrictData?.areas.find((a) => a.name === areaName);
    setFormData((prev) => ({
      ...prev,
      villageOrArea: areaName,
      pinCode: areaData ? areaData.pinCode : prev.pinCode,
    }));
    if (errors.villageOrArea) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.villageOrArea;
        return newErr;
      });
    }
    if (errors.pinCode) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.pinCode;
        return newErr;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  // Validation Logic
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Mobile Number (Indian 10-digit format)
    const mobileClean = formData.mobileNumber.trim().replace(/\D/g, "");
    if (!mobileClean) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (mobileClean.length !== 10 || !/^[6-9]\d{9}$/.test(mobileClean)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit Indian mobile number";
    }

    // Email Address
    const emailTrim = formData.email.trim();
    if (!emailTrim) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Address Line 1
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "House / Flat / Street address is required";
    }

    // District / City
    if (!formData.districtOrCity) {
      newErrors.districtOrCity = "Please select your Gujarat district / city";
    }

    // Village / Area
    if (!formData.villageOrArea) {
      newErrors.villageOrArea = "Please select your village / area";
    }

    // PIN Code (6 digits)
    const pinClean = formData.pinCode.trim();
    if (!pinClean) {
      newErrors.pinCode = "PIN Code is required";
    } else if (!/^\d{6}$/.test(pinClean)) {
      newErrors.pinCode = "PIN Code must be a 6-digit number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setSubmitError(null);

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const elem = document.getElementById(firstErrorKey);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    const customerDetails: CustomerDetails = {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      mobileNumber: formData.mobileNumber.trim().replace(/\D/g, ""),
      email: formData.email.trim(),
    };

    const deliveryAddress: DeliveryAddress = {
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      state: "Gujarat",
      districtOrCity: formData.districtOrCity,
      villageOrArea: formData.villageOrArea,
      pinCode: formData.pinCode.trim(),
    };

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerDetails,
          deliveryAddress,
          cartItems: items.map((i) => ({ packId: i.packId, quantity: i.quantity })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.orderId) {
        setSubmitError(result.error || "Failed to create order in database. Please check your connection and try again.");
        setIsSubmitting(false);
        return;
      }

      // Store created order details for payment step
      const checkoutData: CheckoutData = {
        customerDetails,
        deliveryAddress,
        cartItems: items,
        subtotal: result.order?.subtotal || totalAmount,
        deliveryCharge: result.order?.delivery_charge || 0,
        totalAmount: result.order?.total_amount || totalAmount,
        totalFreeCocopeat,
        createdAt: Date.now(),
      };

      try {
        localStorage.setItem("kp_checkout_data", JSON.stringify(checkoutData));
        localStorage.setItem("kp_current_order_id", result.orderId);
        if (result.order) {
          localStorage.setItem("kp_current_order", JSON.stringify(result.order));
        }
      } catch {
        // Ignore local storage error
      }

      // Navigate to Payment step with created Order ID
      router.push(`/payment?orderId=${result.orderId}`);
    } catch (err: any) {
      console.error("Order creation request failed:", err);
      setSubmitError("Network connection error while placing order. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Safe SSR hydration check
  if (!isHydrated) {
    return (
      <div className="py-20 min-h-[60vh] flex items-center justify-center bg-brand-ivory">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-border/60" />
          <div className="h-4 w-32 bg-brand-border/60 rounded" />
        </div>
      </div>
    );
  }

  // EMPTY CART CHECKOUT STATE
  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 min-h-[70vh] flex items-center bg-brand-ivory">
        <Container size="md">
          <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-subtle max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-green-50 text-brand-green border border-brand-green-100 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green mb-2">
              CHECKOUT
            </span>

            <h1 className="font-serif text-3xl font-bold text-brand-text-primary mb-3">
              Your cart is currently empty
            </h1>

            <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed mb-8 max-w-md">
              Please select your desired pack of Vermicompost Fertiliser before continuing to checkout.
            </p>

            <Button
              variant="primary"
              size="lg"
              href="/#vermicompost-showcase"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              EXPLORE VERMICOMPOST
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-14 lg:py-16 bg-brand-ivory min-h-[85vh]">
      <Container size="lg">
        {/* CHECKOUT PROGRESS INDICATOR */}
        <div className="mb-8 sm:mb-10">
          <CheckoutProgress currentStep={2} />
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col items-start mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-text-primary tracking-tight">
            Customer Details & Delivery
          </h1>
          <p className="text-sm text-brand-text-secondary mt-1">
            Please enter your contact information and Gujarat delivery destination.
          </p>
        </div>

        {/* MAIN 2-COLUMN CHECKOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: FORM (Customer Details + Delivery Address) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
              
              {/* 1. CUSTOMER INFORMATION SECTION */}
              <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-8 border border-brand-border shadow-subtle">
                <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-brand-border/70 text-brand-text-primary">
                  <User className="w-5 h-5 text-brand-green" />
                  <h2 className="font-serif text-xl font-bold">
                    1. Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  {/* First Name */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                      <span>First Name</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramesh"
                      className={cn(
                        "h-12 px-4 rounded-farm bg-white border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                        errors.firstName ? "border-rose-500 ring-1 ring-rose-500/30" : "border-brand-border"
                      )}
                    />
                    {errors.firstName && (
                      <span className="text-xs text-rose-600 font-medium mt-1">
                        {errors.firstName}
                      </span>
                    )}
                  </div>

                  {/* Middle Name (Optional) */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="middleName" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5">
                      Middle Name <span className="text-[10px] text-brand-text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      id="middleName"
                      name="middleName"
                      type="text"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      placeholder="e.g. K."
                      className="h-12 px-4 rounded-farm bg-white border border-brand-border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                      <span>Last Name</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Patel"
                      className={cn(
                        "h-12 px-4 rounded-farm bg-white border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                        errors.lastName ? "border-rose-500 ring-1 ring-rose-500/30" : "border-brand-border"
                      )}
                    />
                    {errors.lastName && (
                      <span className="text-xs text-rose-600 font-medium mt-1">
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Number */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="mobileNumber" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-brand-green" />
                      <span>Mobile Number (10 Digits)</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-sm font-semibold text-brand-text-muted select-none">
                        +91
                      </span>
                      <input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        maxLength={10}
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        className={cn(
                          "w-full h-12 pl-12 pr-4 rounded-farm bg-white border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                          errors.mobileNumber ? "border-rose-500 ring-1 ring-rose-500/30" : "border-brand-border"
                        )}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <span className="text-xs text-rose-600 font-medium mt-1">
                        {errors.mobileNumber}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-brand-green" />
                      <span>Email Address</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ramesh.patel@example.com"
                      className={cn(
                        "h-12 px-4 rounded-farm bg-white border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                        errors.email ? "border-rose-500 ring-1 ring-rose-500/30" : "border-brand-border"
                      )}
                    />
                    {errors.email && (
                      <span className="text-xs text-rose-600 font-medium mt-1">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. GUJARAT DELIVERY ADDRESS SECTION */}
              <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-8 border border-brand-border shadow-subtle">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-border/70">
                  <div className="flex items-center gap-2.5 text-brand-text-primary">
                    <Home className="w-5 h-5 text-brand-green" />
                    <h2 className="font-serif text-xl font-bold">
                      2. Gujarat Delivery Address
                    </h2>
                  </div>
                </div>

                {/* Gujarat Delivery Notice Banner */}
                <div className="mb-6 p-4 rounded-farm bg-brand-green-50 border border-brand-green/20 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-green shrink-0" />
                  <div className="text-xs text-brand-text-secondary leading-snug">
                    <strong className="text-brand-green block sm:inline">
                      Currently delivering across Gujarat.
                    </strong>{" "}
                    Fast direct farm dispatch to your doorstep.
                  </div>
                </div>

                {/* State Locked to Gujarat */}
                <div className="mb-5 flex flex-col text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center justify-between">
                    <span>State</span>
                    <span className="text-[11px] text-brand-green font-medium">Verified Delivery Region</span>
                  </label>
                  <div className="h-12 px-4 rounded-farm bg-brand-ivory-300/80 border border-brand-border flex items-center justify-between text-sm text-brand-text-primary font-semibold select-none">
                    <span>Gujarat</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-green text-brand-ivory uppercase tracking-wider">
                      Fixed
                    </span>
                  </div>
                </div>

                {/* District & Village/Area Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {/* District / City Dropdown */}
                  <SearchableSelect
                    id="districtOrCity"
                    label="District / City"
                    placeholder="Select Gujarat District..."
                    options={districtOptions}
                    value={formData.districtOrCity}
                    onChange={handleDistrictChange}
                    error={errors.districtOrCity}
                    required
                  />

                  {/* Village / Area Dropdown */}
                  <SearchableSelect
                    id="villageOrArea"
                    label="Village / Area"
                    placeholder={
                      formData.districtOrCity
                        ? "Select Village / Area..."
                        : "Select District First"
                    }
                    options={areaOptions}
                    value={formData.villageOrArea}
                    onChange={handleAreaChange}
                    disabled={!formData.districtOrCity}
                    error={errors.villageOrArea}
                    required
                  />
                </div>

                {/* PIN Code & Address Lines */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  {/* PIN Code */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="pinCode" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                      <span>PIN Code (6 Digits)</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      maxLength={6}
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 395004"
                      className={cn(
                        "h-12 px-4 rounded-farm bg-white border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                        errors.pinCode ? "border-rose-500 ring-1 ring-rose-500/30" : "border-brand-border"
                      )}
                    />
                    {errors.pinCode && (
                      <span className="text-xs text-rose-600 font-medium mt-1">
                        {errors.pinCode}
                      </span>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2 flex flex-col text-left">
                    <label htmlFor="addressLine1" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                      <span>Address Line 1 (House/Flat, Road, Building)</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      id="addressLine1"
                      name="addressLine1"
                      type="text"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="e.g. 102, Shivalik Residency, Causeway Road"
                      className={cn(
                        "h-12 px-4 rounded-farm bg-white border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                        errors.addressLine1 ? "border-rose-500 ring-1 ring-rose-500/30" : "border-brand-border"
                      )}
                    />
                    {errors.addressLine1 && (
                      <span className="text-xs text-rose-600 font-medium mt-1">
                        {errors.addressLine1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Address Line 2 (Optional Landmark) */}
                <div className="flex flex-col text-left">
                  <label htmlFor="addressLine2" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5">
                    Address Line 2 / Landmark <span className="text-[10px] text-brand-text-muted font-normal">(Optional)</span>
                  </label>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="e.g. Near Riverfront Garden"
                    className="h-12 px-4 rounded-farm bg-white border border-brand-border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                {/* Supabase Architecture Note */}
                <div className="mt-5 pt-4 border-t border-brand-border/50 text-[11px] text-brand-text-muted">
                  📍 Verified Gujarat delivery locations. Additional PIN codes & areas are dynamically supported.
                </div>
              </div>

              {/* Submission Error Banner */}
              {submitError && (
                <div className="p-4 rounded-farm bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Unable to proceed:</strong>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}

              {/* Submit CTA Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                  icon={
                    isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )
                  }
                  className="w-full sm:w-auto py-4 px-10 text-base shadow-subtle hover:shadow-premium"
                >
                  {isSubmitting ? "Creating Order..." : "Continue to Payment"}
                </Button>

                <Link
                  href="/cart"
                  className="text-xs sm:text-sm text-brand-text-secondary hover:text-brand-green transition-colors py-2"
                >
                  Return to edit cart
                </Link>
              </div>

            </form>
          </div>

          {/* RIGHT: STICKY LIVE ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border/90 shadow-elevated">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border/70">
                <h2 className="font-serif font-bold text-xl text-brand-text-primary">
                  Order Summary
                </h2>
                <span className="text-xs text-brand-green font-semibold">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-brand-border/50 max-h-64 overflow-y-auto pr-1 mb-5">
                {items.map((item) => (
                  <div key={item.packId} className="py-3 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded overflow-hidden border border-brand-border bg-white shrink-0">
                        <Image
                          src="/images/vermicompost-label.png"
                          alt={item.packName}
                          fill
                          sizes="48px"
                          className="object-contain p-0.5"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-brand-text-primary leading-tight">
                          {item.packName}
                        </h4>
                        <span className="text-xs text-brand-text-muted block">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        {item.freeCocopeatKg > 0 && (
                          <span className="text-[10px] font-semibold text-brand-green flex items-center gap-1 mt-0.5">
                            <Gift className="w-3 h-3" />
                            +{item.freeCocopeatKg * item.quantity} KG Cocopeat FREE
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-serif font-bold text-sm text-brand-text-primary shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-3 pt-3 border-t border-brand-border text-sm text-brand-text-secondary mb-6">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-brand-text-primary">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {totalFreeCocopeat > 0 && (
                  <div className="flex items-center justify-between text-brand-green font-medium">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      Free Cocopeat Bonus:
                    </span>
                    <span>+{totalFreeCocopeat} KG FREE</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Delivery Charges:</span>
                  <span className="text-brand-green font-semibold">FREE DELIVERY</span>
                </div>

                <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                  <span className="font-serif font-bold text-lg text-brand-text-primary">
                    Final Payable:
                  </span>
                  <span className="font-serif font-bold text-2xl text-brand-green">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="pt-4 border-t border-brand-border/60 flex flex-col gap-2 text-xs text-brand-text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                  <span>100% Authentic KP Natural Farm Sourcing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Doorstep delivery throughout Gujarat</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
