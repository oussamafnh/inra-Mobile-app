import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { Button, Input, Div, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { getItem } from '../utils/authToken';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

interface Axe {
  _id: string;
  AXE: string;
  createdAt: string;
  status: string;
}

export default function ListAxes() {
  const [axes, setAxes] = useState<Axe[]>([]);
  const [megaprojet, setMegaprojet] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { megaprojet_id } = useLocalSearchParams();

  useEffect(() => {
    const fetchAxes = async () => {
      try {
        setLoading(true);
        const storedToken = await getItem('authToken');

        if (!storedToken) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets/${megaprojet_id}/axes`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );

        if (response.data.message === 'AXEs retrieved successfully') {
          setMegaprojet(response.data.megaprojet || '');
          setAxes(Array.isArray(response.data.data) ? response.data.data : []);
        } else if (response.data.message === 'User not found') {
          router.push('/auth');
        } else {
          throw new Error('Unexpected response message');
        }
      } catch (error: any) {
        setError('Failed to fetch axes');
      } finally {
        setLoading(false);
      }
    };

    fetchAxes();
  }, [megaprojet_id, router]);

  const renderAxeItem = (axe: Axe) => {
    const isDisabled = axe.status === 'disabled';
    return (
      <Div
        key={axe._id}
        p="lg"
        mb="md"
        bg="white"
        rounded="md"
        borderWidth={1}
        borderColor="gray300"
        flexDir="row"
        alignItems="center"
        w="100%"
        opacity={isDisabled ? 0.5 : 1}
        style={Platform.OS === 'web' ? {
          maxWidth: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        } : {}}
        {...(Platform.OS === 'web' && {
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = '#f7fafc';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
          }
        })}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            ...(Platform.OS === 'web' && {
              cursor: 'pointer',
              outline: 'none',
              userSelect: 'none',
            })
          }}
          onPress={() => router.push(`/admin/listactivites?axe_id=${axe._id}`)}
          activeOpacity={0.7}
        >
          <Div w="100%">
            <Text
              fontSize="lg"
              fontWeight="bold"
              numberOfLines={Platform.OS === 'web' ? undefined : 2}
              textAlign="left"
              w="100%"
              style={Platform.OS === 'web' ? {
                wordWrap: 'break-word',
                lineHeight: '1.4',
              } : {}}
            >
              {axe.AXE}
            </Text>
          </Div>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 48,
            minHeight: 48,
            ...(Platform.OS === 'web' && {
              cursor: 'pointer',
              borderRadius: 8,
              transition: 'all 0.2s ease',
            })
          }}
          onPress={() => {
            const params = {
              axe_id: axe._id,
              AXE: axe.AXE,
              status: axe.status
            };
            router.push({
              pathname: '/admin/editAxe',
              params: params
            });
          }}
          activeOpacity={0.7}
          {...(Platform.OS === 'web' && {
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          })}
        >
          <Icon name="edit" fontSize="xl" color="blue600" />
        </TouchableOpacity>
      </Div>
    );
  };

  return (
    <Div flex={1} bg="gray100">
      <Header
        p="lg"
        borderBottomWidth={1}
        borderBottomColor="gray200"
        alignment="center"
        bg="white"
        prefix={
          <TouchableOpacity
            onPress={() => router.back()}
            style={Platform.OS === 'web' ? {
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              transition: 'all 0.2s ease',
            } : {}}
            {...(Platform.OS === 'web' && {
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#f7fafc';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            })}
          >
            <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
          </TouchableOpacity>
        }
      >
        <Text w="60%" numberOfLines={1} ellipsizeMode="tail" fontSize="lg" fontWeight="bold">
          {megaprojet}
        </Text>
      </Header>

      <Div flex={1} mt="lg" p="lg">
        <TouchableOpacity
          style={{
            backgroundColor: '#10b981',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 8,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            ...(Platform.OS === 'web' && {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            })
          }}
          onPress={() =>
            router.push(
              `/admin/addaxe?megaprojet_id=${megaprojet_id}&megaprojet_name=${megaprojet}`
            )
          }
          activeOpacity={0.8}
          {...(Platform.OS === 'web' && {
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-1px)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(0px)';
            }
          })}
        >
          <Icon name="plus" fontFamily="Feather" fontSize="lg" color="white" style={{ marginRight: 8 }} />
          <Text color="white" fontWeight="bold" fontSize="md">
            Ajouter un Axe à ce Projet
          </Text>
        </TouchableOpacity>

        <Input
          mb="lg"
          placeholder="Rechercher un axe..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          borderWidth={1}
          rounded="md"
          borderColor="gray300"
          p="md"
          bg="white"
          suffix={
            <Icon
              name="search"
              fontFamily="Feather"
              color="gray500"
              fontSize="lg"
            />
          }
        />

        <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Div flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color="blue" />
            </Div>
          ) : error ? (
            <Div flex={1} justifyContent="center" alignItems="center">
              <Text color="red500">{error}</Text>
            </Div>
          ) : (
            axes
              .filter((axe) => axe.AXE?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((axe) => renderAxeItem(axe))
          )}
        </ScrollDiv>
      </Div>
    </Div>
  );
}
