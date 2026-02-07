import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCategoryViewModel } from '../viewmodels/CategoryViewModel';
import { Category } from '../models/Category';

const ICONS = ['fast-food', 'car', 'film', 'cart', 'apps', 'briefcase', 'home', 'construct', 'flower', 'airplane'];
const COLORS = ['#FF6347', '#4682B4', '#9370DB', '#20B2AA', '#808080', '#FFA500', '#FF4500', '#32CD32'];

const CategoriesScreen = () => {
  const { categories, loading, addCategory, deleteCategory } = useCategoryViewModel();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAddCategory = () => {
    if (name.trim()) {
      addCategory(name, selectedIcon, selectedColor);
      setName('');
      setSelectedIcon(ICONS[0]);
      setSelectedColor(COLORS[0]);
    } else {
      Alert.alert('Error', 'Please enter a category name');
    }
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="white" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Category Name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Select Icon:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                selectedIcon === icon && styles.selectedOption,
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <Ionicons name={icon as any} size={24} color={selectedIcon === icon ? 'blue' : 'black'} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Select Color:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </ScrollView>

        <Button title="Add Category" onPress={handleAddCategory} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selector: {
    marginBottom: 10,
  },
  iconOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 5,
    marginRight: 10,
  },
  selectedOption: {
    borderColor: 'blue',
    backgroundColor: '#e6f0ff',
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: 'black',
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
});

export default CategoriesScreen;
