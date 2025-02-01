import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {supabase} from '../lib/supabase';
import type {Product} from '../types/product.types';

export const MyProductsScreen = ({navigation}: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchMyProducts = async () => {
    try {
      const {data: userData, error: userError} = await supabase.auth.getUser();
      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }

      if (!userData.user) {
        console.error('No user found');
        throw new Error('User not found');
      }

      setUserId(userData.user.id);
      console.log('Fetching products for user:', userData.user.id);

      const {data, error} = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', {ascending: false});

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('My products fetched:', data);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error in fetchMyProducts:', error);
      Alert.alert('Error', 'Failed to load your products');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyProducts();
    setRefreshing(false);
  };

  const handleDelete = async (productId: string) => {
    try {
      console.log('Deleting product:', productId);
      const {error} = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Product deleted successfully');
      setProducts(currentProducts =>
        currentProducts.filter(product => product.id !== productId),
      );
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchMyProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:products:user')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          console.log('New product inserted:', payload);
          setProducts(currentProducts => [payload.new, ...currentProducts]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          console.log('Product deleted:', payload);
          setProducts(currentProducts =>
            currentProducts.filter(product => product.id !== payload.old.id),
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          console.log('Product updated:', payload);
          setProducts(currentProducts =>
            currentProducts.map(product =>
              product.id === payload.new.id ? payload.new : product,
            ),
          );
        },
      );

    channel.subscribe(status => {
      console.log('Subscription status:', status);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  // Add focus listener to refresh products when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('My Products screen focused, refreshing products...');
      fetchMyProducts();
    });

    return unsubscribe;
  }, [navigation]);

  const renderProduct = ({item}: {item: Product}) => (
    <View style={styles.productCard}>
      <View style={styles.productContent}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Delete',
                onPress: () => handleDelete(item.id),
                style: 'destructive',
              },
            ],
          )
        }>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            You haven't added any products yet
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productContent: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  productDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 20,
  },
});
