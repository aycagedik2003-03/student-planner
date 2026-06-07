import React, { useState, useCallback } from 'react';
import {
  View, Modal, TouchableOpacity, Text,
  ActivityIndicator, Platform, StyleSheet,
} from 'react-native';

// react-easy-crop is a web-only dep — load lazily so mobile doesn't crash
let Cropper: any = null;
if (Platform.OS === 'web') {
  try { Cropper = require('react-easy-crop').default; } catch {}
}

import { useT } from '../i18n/translations';

type Area = { x: number; y: number; width: number; height: number };

interface Props {
  visible: boolean;
  imagePath: string;          // dataURL (web) or file URI (mobile)
  onCropConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

async function cropImageOnCanvas(
  src: string,
  px: Area,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new (window as any).Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = px.width;
      canvas.height = px.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function PhotoCropperModal({ visible, imagePath, onCropConfirm, onCancel }: Props) {
  const { t } = useT();
  const [crop,            setCrop]            = useState({ x: 0, y: 0 });
  const [zoom,            setZoom]            = useState(1);
  const [croppedAreaPx,   setCroppedAreaPx]   = useState<Area | null>(null);
  const [confirming,      setConfirming]      = useState(false);

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setCroppedAreaPx(areaPx);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPx) { onCropConfirm(imagePath); return; }
    setConfirming(true);
    try {
      const result = await cropImageOnCanvas(imagePath, croppedAreaPx);
      onCropConfirm(result);
    } catch {
      // Canvas crop failed — pass the original image
      onCropConfirm(imagePath);
    } finally {
      setConfirming(false);
    }
  };

  if (Platform.OS !== 'web' || !Cropper) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{t('edit_photo')}</Text>

          {/* Crop area */}
          <View style={s.cropWrap}>
            <Cropper
              image={imagePath}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </View>

          {/* Zoom slider — plain HTML input works fine on RN Web */}
          <View style={s.sliderWrap}>
            <Text style={s.sliderLabel}>{t('zoom')}</Text>
            {/* @ts-ignore — html input not in RN types but works on web */}
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e: any) => setZoom(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: '#00CFC8' }}
            />
          </View>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onCancel}
              disabled={confirming}
              activeOpacity={0.8}
            >
              <Text style={s.cancelTxt}>{t('crop_cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.confirmBtn, confirming && s.btnDisabled]}
              onPress={handleConfirm}
              disabled={confirming}
              activeOpacity={0.85}
            >
              {confirming
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.confirmTxt}>{t('crop_confirm')} ✓</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  cropWrap: {
    width: '100%',
    height: 300,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
  },
  sliderWrap: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelTxt: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#00CFC8',
    alignItems: 'center',
    shadowColor: '#00CFC8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  confirmTxt: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
