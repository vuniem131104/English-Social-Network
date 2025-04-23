# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# EnglishSocial Shopping Module

## Overview
The shopping module for EnglishSocial provides a complete e-commerce experience for purchasing English learning resources. Users can browse products, add them to cart, and complete the checkout process.

## Features
- Product browsing by categories (Grammar, Vocabulary, Exam Prep, Courses)
- Product search functionality
- Shopping cart with quantity adjustments
- Order confirmation with animated success feedback

## Key Components

### 1. Shop Screen
- Displays product listings organized by categories
- Features search functionality
- Shows featured products in a horizontal carousel
- Provides easy access to the shopping cart

### 2. Cart Screen
- Lists all items added to cart
- Allows quantity adjustment for each item
- Calculates subtotal, shipping, and total costs
- Provides checkout functionality

### 3. Order Confirmation Screen
- Confirms successful order placement
- Displays order details including items purchased
- Shows estimated delivery date
- Provides option to continue shopping

## State Management
The shopping cart is managed through Redux:

- **Actions**: Add to cart, remove from cart, update quantity, clear cart
- **Reducer**: Handles cart state updates and calculates totals
- **Store**: Maintains the global state for cart items

## Navigation
The shopping module integrates with the app's navigation system:

- Shop screen is accessible from the main tab navigator
- Cart is accessible from multiple points in the app
- Order confirmation appears after successful checkout

## Usage
To use the shopping functionality:

1. Navigate to the Shop tab in the bottom navigation
2. Browse products or search for specific items
3. Add products to cart using the cart icon
4. View cart and adjust quantities as needed
5. Proceed to checkout to complete purchase

## Future Enhancements
- User reviews and ratings
- Wishlist functionality
- Related products recommendations
- Order history and tracking
