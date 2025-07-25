import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Div, Button, Input, Text, Header, Icon } from 'react-native-magnus';
import axios from 'axios';
import { saveItem, getItem, deleteItem } from '../utils/authToken';

export default function AddAxe() {
    const { megaprojet_id, megaprojet_name } = useLocalSearchParams();
    const [formData, setFormData] = useState({
        megaprojet_id: megaprojet_id || '',
        AXE: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleInputChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
        const storedToken = await getItem('authToken');
        if (!storedToken) {
            router.push('/auth');
            return;
        }

        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/projets/axe`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            }
        );

        if (response.data.message === "User not found") {
            router.push('/auth');
            return;
        }

        router.push(`/admin/listaxes?megaprojet_id=${megaprojet_id}`);
    } catch (error: any) {
        console.error(error);
        setError('Failed to add axe. Please try again.');
    } finally {
        setLoading(false);
    }
};

    return (
        <Div flex={1} justifyContent="center" w="100%" alignItems="center" p="xl">
            {}
            <Header
                p="lg"
                borderBottomWidth={1}
                borderBottomColor="gray200"
                alignment="center"
                position="absolute"
                top={0}
                left={0}
                right={0}
                zIndex={10}
                bg="white"
                prefix={
                    <Button bg="transparent" onPress={() => router.back()}>
                        <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
                    </Button>
                }
            >
                Ajouter un Axe
            </Header>

            {}
            <Text fontSize="lg" fontWeight="bold" mb="lg" mt="xxl">
                Ajouter un axe à ce mégaprojet
            </Text>

            {}
            <Input
                readOnly
                value={megaprojet_name || 'Nom du mégaprojet non disponible'}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="green500"
                textColor="green500"
                rounded="md"
                p="md"
                bg="gray100"
                multiline
                style={{
                    textAlignVertical: 'top',
                    minHeight: 40,
                }}
            />

            {}
            <Input
                placeholder="Nom de l'Axe"
                value={formData.AXE}
                onChangeText={(value) => handleInputChange('AXE', value)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
            />

            <Button
                bg="green500"
                rounded="md"
                w="100%"
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
        </Div>
    );
}
