#!/bin/bash

rm -f /usr/bin/rekodi || true
rm -f /usr/share/applications/rekodi-x64.desktop || true

ln -s /usr/share/rekodi-linux-x64/rekodi /usr/bin/rekodi
cp /usr/share/rekodi-linux-ia32/resources/app/assets/linux/rekodi-x64.desktop /usr/share/applications/
