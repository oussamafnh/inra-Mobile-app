import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Div, Button, Input, Text, Header, Icon } from 'react-native-magnus';
import axios from 'axios';
import { saveItem, getItem, deleteItem } from '../utils/authToken';

export default function AjouterMegaprojet() {
    const [formData, setFormData] = useState({
        MEGAPROJET: '',
        filiere: '',
        COORDINATEUR: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleInputChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });

        if (successMessage) setSuccessMessage(null);
        if (error) setError(null);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const storedToken = await getItem('authToken');
            if (!storedToken) {
                router.push('/auth');
                return;
            }

            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojet`,
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

            setSuccessMessage('Mégaprojet ajouté avec succès!');

            setTimeout(() => {
                router.push('/admin/listprojets');
            }, 1000);
        } catch (error: any) {

            setError('Échec de l\'ajout du mégaprojet. Veuillez réessayer.');
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
                Ajouter un Mégaprojet
            </Header>

            {}
            <Input
                placeholder="Nom du Mégaprojet"
                value={formData.MEGAPROJET}
                onChangeText={(value) => handleInputChange('MEGAPROJET', value)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
            />
            <Input
                placeholder="Filière"
                value={formData.filiere}
                onChangeText={(value) => handleInputChange('filiere', value)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
            />
            {}
            <Input
                placeholder="Coordinateur"
                value={formData.COORDINATEUR}
                onChangeText={(value) => handleInputChange('COORDINATEUR', value)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
            />

            {}
            <Button
                bg={error ? 'red500' : successMessage ? 'green500' : 'green500'}
                rounded="md"
                w="100%"
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? 'Ajout en cours...' : successMessage || error || 'Ajouter'}
            </Button>

        </Div>
    );
}
