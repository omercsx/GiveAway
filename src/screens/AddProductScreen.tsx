import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {supabase} from '../lib/supabase';
import type {CreateProduct} from '../types/product.types';

export const AddProductScreen = ({navigation}: any) => {
  const [product, setProduct] = useState<CreateProduct>({
    title: '',
    description: '',
  });

  const handleSubmit = async () => {
    try {
      if (!product.title.trim() || !product.description.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const {data: userData, error: userError} = await supabase.auth.getUser();
      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }

      if (!userData.user) {
        console.error('No user found');
        throw new Error('User not found');
      }

      console.log('Creating product with user_id:', userData.user.id);

      const {data, error} = await supabase
        .from('products')
        .insert({
          title: product.title.trim(),
          description: product.description.trim(),
          user_id: userData.user.id,
        })
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Product created successfully:', data);

      Alert.alert('Success', 'Product added successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={product.title}
              onChangeText={text => setProduct({...product, title: text})}
              placeholder="Enter product title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={product.description}
              onChangeText={text => setProduct({...product, description: text})}
              placeholder="Enter product description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0284c7',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
