import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

/**
 * Styles shared by the add/edit modals and settings forms.
 */
export const createFormStyles = (theme: Theme) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.overlay,
    },
    modalView: {
      width: '90%',
      maxWidth: 480,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.xl,
      alignItems: 'stretch',
    },
    modalTitle: {
      ...theme.typography.heading,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    input: {
      ...theme.typography.body,
      color: theme.colors.text,
      minHeight: theme.minTouch,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.bg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.input,
      marginBottom: theme.spacing.md,
    },
    inputText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.muted,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    button: {
      flex: 1,
    },
  });
