const enTranslations = {
  app: {
    title: "Therapeutic Nutrition App for Diabetics",
    tagline: "Personalized dietary support for diabetic patients",
    toggleTheme: "Toggle Theme",
    changeLanguage: "Change Language"
  },
  tabs: {
    mealAnalysis: "Meal Analysis",
    chatbot: "Smart Assistant",
    mealLog: "Meal Log",
    profile: "Profile"
  },
  navigation: {
    mainNav: "Main Navigation"
  },
  footer: {
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    contact: "Contact Us",
    copyright: "© {year} Therapeutic Nutrition App for Diabetics. All rights reserved."
  },
  accessibility: {
    options: "Accessibility Options",
    toggleContrast: "Toggle High Contrast",
    textSize: "Text Size",
    textSizeNormal: "Normal Size",
    textSizeLarge: "Large Size",
    textSizeXL: "Extra Large Size"
  },
  imageUpload: {
    title: "Take a photo of your meal",
    dragDropArea: "Click to upload an image or drag and drop here",
    dragDrop: "Drag and drop an image here, or",
    browse: "browse from your device",
    supportedFormats: "Supports JPG, PNG - max 5MB",
    capturePhoto: "Capture Photo",
    troubleManualEntry: "Having trouble? Try manual food entry",
    invalidType: "Invalid file type",
    invalidTypeDesc: "Please upload a JPG or PNG image",
    tooLarge: "File too large",
    tooLargeDesc: "Please upload an image less than 5MB"
  },
  manualEntry: {
    title: "Or enter food manually",
    searchLabel: "Search for food",
    searchPlaceholder: "Example: rice, bread, apple...",
    continue: "Continue",
    loadError: "Error loading food list",
    loadErrorDesc: "We couldn't load the food list. Please try again.",
    noFoodSelected: "No food selected",
    selectFood: "Please select at least one food to analyze",
    noResults: "No matching results. Try a different search term."
  },
  recognizedFood: {
    foodImage: "Food Image",
    reupload: "Reupload Image",
    foodsTitle: "Recognized Foods:",
    confidence: "confidence",
    deleteFood: "Delete {food}",
    addAnother: "Add another food",
    listenToFoods: "Listen to food list"
  },
  nutritionAnalysis: {
    title: "Nutritional Analysis",
    listen: "Listen to nutritional analysis",
    calories: "Calories",
    carbs: "Carbs",
    protein: "Protein",
    fat: "Fat",
    sugar: "Sugar",
    glycemicIndex: "Glycemic Index"
  },
  diabetesSuitability: {
    title: "Diabetes Suitability",
    listen: "Listen to diabetes suitability",
    safe: "Safe for Diabetics",
    moderate: "Moderate Consumption",
    avoid: "Avoid",
    description: {
      safe: "This meal is safe for diabetic patients. It has relatively low carbohydrate content and a low glycemic index, meaning it will have minimal impact on blood sugar levels.",
      moderate: "This meal is moderately suitable for diabetic patients. The carbohydrate content is acceptable, but it should be consumed in moderate portions with blood sugar monitoring afterward.",
      avoid: "It's best to avoid this meal if you have diabetes. It contains high levels of fast-absorbing carbohydrates or sugars, which may cause rapid blood sugar spikes."
    }
  },
  actionButtons: {
    saveToLog: "Save to Log",
    consultChatbot: "Consult Smart Assistant",
    analyzeNew: "Analyze New Meal"
  },
  chatbot: {
    title: "Smart Assistant",
    pageTitle: "Diabetic Nutrition Smart Assistant",
    pageDescription: "Ask your questions about appropriate nutrition for diabetic patients and dietary guidelines. The smart assistant is ready to answer your queries.",
    nutritionQuestionsTitle: "Common Nutrition Questions",
    mealSuggestionsTitle: "Meal Suggestions",
    welcome: "Hello! I'm the Smart Assistant for the Therapeutic Nutrition App. How can I help you today?",
    inputPlaceholder: "Type your question here...",
    useMicrophone: "Use microphone for voice input",
    send: "Send",
    suggestion: "Try questions like: \"Can I eat fruits?\" or \"Suggest a healthy dinner\"",
    error: "An error occurred",
    errorDesc: "We couldn't process your request. Please try again.",
    errorMessage: "Sorry, an error occurred while processing your request. Please try again.",
    question1: "Can I eat fruits?",
    question2: "What foods help lower blood sugar?",
    question3: "How many carb servings can I have daily?",
    suggestion1: "Suggest a diabetic-friendly breakfast",
    suggestion2: "What are alternatives to white rice?",
    suggestion3: "How do I handle post-meal blood sugar spikes?"
  },
  speech: {
    notSupported: "Speech recognition not supported",
    notSupportedDesc: "Your browser doesn't support speech recognition. Please try another browser like Chrome, Edge, or Safari.",
    listening: "Listening...",
    listeningDesc: "Speak clearly into the microphone",
    error: "Speech recognition error",
    errorDesc: "An error occurred during speech recognition: {error}",
    recognizedFoods: "The following foods were recognized: {foods}",
    nutritionInfo: "Nutritional analysis of the meal: {calories} calories, {carbs}g carbohydrates, {protein}g protein, {fat}g fat, and {sugar}g sugar.",
    suitability: {
      safe: "This meal consisting of {foods} is safe for diabetic patients.",
      moderate: "This meal consisting of {foods} is moderately suitable for diabetic patients. Please consume in moderation.",
      avoid: "It's best to avoid this meal consisting of {foods} due to its potential negative impact on blood sugar levels."
    }
  },
  mealAnalysis: {
    title: "Analyze Your Meals",
    description: "Take a photo of your meal or enter foods manually to get nutritional analysis and diabetes suitability assessment.",
    analyzing: "Analyzing meal...",
    imageAnalysisError: "Error analyzing image",
    imageAnalysisErrorDesc: "We couldn't analyze the image. Please ensure the image is clear or try entering food manually.",
    analysisError: "Analysis error",
    analysisErrorDesc: "An error occurred while analyzing nutritional information. Please try again.",
    savedToLog: "Saved to log",
    savedToLogDesc: "This meal has been saved to your meal log.",
    saveError: "Save error",
    saveErrorDesc: "We couldn't save the meal to your log. Please try again."
  },
  mealLog: {
    title: "Your Meal Log",
    description: "Track previous meals and monitor your nutrition patterns over time.",
    fetchError: "Error loading meal log",
    fetchErrorDesc: "We couldn't load your meal log. Please try again.",
    deleteSuccess: "Successfully deleted",
    deleteSuccessDesc: "The meal has been removed from your log.",
    deleteError: "Delete error",
    deleteErrorDesc: "We couldn't delete the meal. Please try again.",
    weeklyAnalysis: "Weekly Analysis",
    noData: "No data available to display",
    noLogs: "No meals in your log",
    startTracking: "Start tracking your meals to get detailed analysis",
    analyzeFirstMeal: "Analyze first meal",
    tabs: {
      overview: "Overview",
      daily: "Daily Log"
    },
    stats: {
      avgCalories: "Avg. Daily Calories",
      avgCarbs: "Avg. Daily Carbs",
      avgSugar: "Avg. Daily Sugar"
    }
  },
  profile: {
    title: "Profile",
    description: "Manage your personal information and application settings.",
    userAvatar: "User avatar",
    guest: "Guest",
    changePhoto: "Change Photo",
    preferences: "App Preferences",
    saveChanges: "Save Changes",
    saving: "Saving...",
    fields: {
      name: "Name",
      age: "Age",
      diabetesType: "Diabetes Type",
      notifications: "Enable Notifications",
      highContrast: "High Contrast Mode",
      largeFont: "Large Font"
    },
    placeholders: {
      name: "Enter your name",
      age: "Enter your age"
    },
    diabetesTypes: {
      type1: "Type 1",
      type2: "Type 2",
      gestational: "Gestational",
      none: "No Diabetes"
    },
    descriptions: {
      notifications: "Receive reminders and important updates",
      highContrast: "Enhance visibility for visually impaired users",
      largeFont: "Increase text size throughout the app"
    }
  },
  user: {
    loginSuccess: "Login successful",
    loginSuccessDesc: "Welcome back, {name}!",
    loginError: "Login error",
    loginErrorDesc: "Login failed. Please check your username and password.",
    logoutSuccess: "Logout successful",
    logoutError: "Logout error",
    notLoggedIn: "Not logged in",
    loginRequired: "Please log in to use this feature",
    updateSuccess: "Profile updated",
    updateSuccessDesc: "Your personal information has been successfully updated",
    updateError: "Profile update error",
    updateErrorDesc: "We couldn't update your information. Please try again."
  }
};

export default enTranslations;
