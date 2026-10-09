#!/usr/bin/env python3
"""
generate_kai_glb.py
Generates a textured 3D glTF 2.0 binary (.glb) model of Kai the Eco Hero,
derived directly from the turnaround photo sheet (hero-model-sheet.png).

Hierarchy:
  Kai (Root)
    └── BodyRoot (Position bobbing & root translation)
          ├── TorsoGroup
          │     ├── TorsoMesh (Yellow hoodie body)
          │     ├── TorsoFront (Textured photo: kangaroo pocket, zipper, drawstrings)
          │     ├── HoodieHem (Ribbed hem band)
          │     ├── HoodieCollar (Collar fold)
          │     ├── DrawstringL / DrawstringR
          │     └── BackpackGroup
          │           ├── BackpackMesh (Olive green volume)
          │           ├── BackpackBack (Textured photo: leaf eco badge & buckle)
          │           └── BackpackFlap (Flap & straps)
          ├── HeadPivot (Rotatable head for nodding / look-at)
          │     ├── HeadMesh (Peach skin base)
          │     ├── FaceFront (Textured photo: anime eyes, blush, cute smile)
          │     ├── EarL / EarR (Cute peach ears)
          │     ├── HairTop (Spiky volumetric hair crown)
          │     ├── HairBack (Layered hair volume)
          │     ├── HairBangs (Spiky anime front bangs)
          │     └── HairSideL / HairSideR (Sideburn tufts)
          ├── LeftArmPivot (Shoulder pivot, rotatable X / Z)
          │     ├── UpperArm (Yellow hoodie sleeve)
          │     ├── SleeveCuff (Yellow cuff)
          │     └── LeftHand (Peach skin hand)
          ├── RightArmPivot (Shoulder pivot, rotatable X / Z)
          │     ├── UpperArm (Yellow hoodie sleeve)
          │     ├── SleeveCuff (Yellow cuff)
          │     └── RightHand (Peach skin hand)
          ├── LeftLegPivot (Hip pivot, rotatable X)
          │     ├── Shorts (Denim shorts leg)
          │     ├── ShortsCuff (Cuff hem)
          │     ├── KneeShin (Peach skin leg)
          │     ├── Sock (White athletic sock)
          │     └── SneakerGroup
          │           ├── SneakerBody (Blue sneaker body with side logo)
          │           ├── SneakerSole (White rubber sole)
          │           └── SneakerToeCap (White toe bumper)
          └── RightLegPivot (Hip pivot, rotatable X)
                ├── Shorts (Denim shorts leg)
                ├── ShortsCuff (Cuff hem)
                ├── KneeShin (Peach skin leg)
                ├── Sock (White athletic sock)
                └── SneakerGroup
                      ├── SneakerBody (Blue sneaker body with side logo)
                      ├── SneakerSole (White rubber sole)
                      └── SneakerToeCap (White toe bumper)
"""

import os
import json
import struct
import numpy as np
from PIL import Image

class GLTFBuilder:
    def __init__(self):
        self.images = []       # list of dicts: {'bytes': b'...', 'mimeType': 'image/png'}
        self.textures = []     # list of dicts: {'source': img_idx}
        self.materials = []    # list of gltf material dicts
        self.meshes = []       # list of gltf mesh dicts
        self.nodes = []        # list of gltf node dicts
        
        # Binary data accumulators
        self.buffer_bytes = bytearray()
        self.buffer_views = [] # list of gltf bufferView dicts
        self.accessors = []    # list of gltf accessor dicts

    def _pad4(self, b: bytes) -> bytes:
        pad = (4 - (len(b) % 4)) % 4
        return b + b'\x00' * pad

    def add_image(self, file_path: str) -> int:
        with open(file_path, 'rb') as f:
            raw = f.read()
        idx = len(self.images)
        self.images.append({'bytes': raw, 'mimeType': 'image/png'})
        self.textures.append({'source': idx})
        return idx

    def add_material(self, name: str, base_color=(1.0, 1.0, 1.0, 1.0), texture_idx=None, roughness=0.5, metallic=0.0, double_sided=False) -> int:
        pbr = {
            'baseColorFactor': list(base_color),
            'roughnessFactor': float(roughness),
            'metallicFactor': float(metallic),
        }
        if texture_idx is not None:
            pbr['baseColorTexture'] = {'index': texture_idx}
        
        mat = {
            'name': name,
            'pbrMetallicRoughness': pbr,
            'doubleSided': double_sided
        }
        idx = len(self.materials)
        self.materials.append(mat)
        return idx

    def _add_buffer_data(self, data_bytes: bytes, target: int = None) -> tuple:
        """Adds data to buffer and returns (bufferView_idx, byte_offset, byte_length)"""
        padded = self._pad4(data_bytes)
        offset = len(self.buffer_bytes)
        self.buffer_bytes.extend(padded)
        
        bv_idx = len(self.buffer_views)
        bv = {
            'buffer': 0,
            'byteOffset': offset,
            'byteLength': len(data_bytes),
        }
        if target is not None:
            bv['target'] = target
        self.buffer_views.append(bv)
        return bv_idx, offset, len(data_bytes)

    def add_geometry(self, positions: np.ndarray, normals: np.ndarray, uvs: np.ndarray, indices: np.ndarray, material_idx: int, mesh_name: str) -> int:
        """
        Creates accessors and bufferViews for a single primitive geometry and returns mesh_idx.
        """
        pos_bytes = positions.astype(np.float32).tobytes()
        norm_bytes = normals.astype(np.float32).tobytes()
        uv_bytes = uvs.astype(np.float32).tobytes()
        idx_bytes = indices.astype(np.uint16).tobytes()

        # Add bufferViews (34962 = ARRAY_BUFFER, 34963 = ELEMENT_ARRAY_BUFFER)
        pos_bv, _, _ = self._add_buffer_data(pos_bytes, target=34962)
        norm_bv, _, _ = self._add_buffer_data(norm_bytes, target=34962)
        uv_bv, _, _ = self._add_buffer_data(uv_bytes, target=34962)
        idx_bv, _, _ = self._add_buffer_data(idx_bytes, target=34963)

        # Min/max for position accessor (required by glTF spec)
        pos_min = positions.min(axis=0).tolist()
        pos_max = positions.max(axis=0).tolist()

        acc_pos = len(self.accessors)
        self.accessors.append({
            'bufferView': pos_bv,
            'byteOffset': 0,
            'componentType': 5126, # FLOAT
            'count': len(positions),
            'type': 'VEC3',
            'min': pos_min,
            'max': pos_max
        })

        acc_norm = len(self.accessors)
        self.accessors.append({
            'bufferView': norm_bv,
            'byteOffset': 0,
            'componentType': 5126,
            'count': len(normals),
            'type': 'VEC3'
        })

        acc_uv = len(self.accessors)
        self.accessors.append({
            'bufferView': uv_bv,
            'byteOffset': 0,
            'componentType': 5126,
            'count': len(uvs),
            'type': 'VEC2'
        })

        acc_idx = len(self.accessors)
        self.accessors.append({
            'bufferView': idx_bv,
            'byteOffset': 0,
            'componentType': 5123, # UNSIGNED_SHORT
            'count': len(indices),
            'type': 'SCALAR'
        })

        mesh_idx = len(self.meshes)
        self.meshes.append({
            'name': mesh_name,
            'primitives': [{
                'attributes': {
                    'POSITION': acc_pos,
                    'NORMAL': acc_norm,
                    'TEXCOORD_0': acc_uv,
                },
                'indices': acc_idx,
                'material': material_idx
            }]
        })
        return mesh_idx

    def create_box(self, width: float, height: float, depth: float, material_idx: int, name: str) -> int:
        hw, hh, hd = width / 2, height / 2, depth / 2
        # 6 faces: +Z (front), -Z (back), +Y (top), -Y (bottom), +X (right), -X (left)
        verts = [
            # Front (+Z)
            [-hw, -hh,  hd], [ hw, -hh,  hd], [ hw,  hh,  hd], [-hw,  hh,  hd],
            # Back (-Z)
            [ hw, -hh, -hd], [-hw, -hh, -hd], [-hw,  hh, -hd], [ hw,  hh, -hd],
            # Top (+Y)
            [-hw,  hh,  hd], [ hw,  hh,  hd], [ hw,  hh, -hd], [-hw,  hh, -hd],
            # Bottom (-Y)
            [-hw, -hh, -hd], [ hw, -hh, -hd], [ hw, -hh,  hd], [-hw, -hh,  hd],
            # Right (+X)
            [ hw, -hh,  hd], [ hw, -hh, -hd], [ hw,  hh, -hd], [ hw,  hh,  hd],
            # Left (-X)
            [-hw, -hh, -hd], [-hw, -hh,  hd], [-hw,  hh,  hd], [-hw,  hh, -hd],
        ]
        normals = [
            [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1],
            [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1],
            [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0],
            [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0],
            [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0],
            [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0],
        ]
        uvs = [
            [0, 1], [1, 1], [1, 0], [0, 0],
            [0, 1], [1, 1], [1, 0], [0, 0],
            [0, 1], [1, 1], [1, 0], [0, 0],
            [0, 1], [1, 1], [1, 0], [0, 0],
            [0, 1], [1, 1], [1, 0], [0, 0],
            [0, 1], [1, 1], [1, 0], [0, 0],
        ]
        indices = []
        for face in range(6):
            b = face * 4
            indices.extend([b, b+1, b+2, b, b+2, b+3])
        return self.add_geometry(
            np.array(verts, dtype=np.float32),
            np.array(normals, dtype=np.float32),
            np.array(uvs, dtype=np.float32),
            np.array(indices, dtype=np.uint16),
            material_idx,
            name
        )

    def create_quad(self, width: float, height: float, material_idx: int, name: str, facing: str = '+Z') -> int:
        hw, hh = width / 2, height / 2
        if facing == '+Z':
            verts = [[-hw, -hh, 0], [hw, -hh, 0], [hw, hh, 0], [-hw, hh, 0]]
            norm = [0, 0, 1]
        elif facing == '-Z':
            verts = [[hw, -hh, 0], [-hw, -hh, 0], [-hw, hh, 0], [hw, hh, 0]]
            norm = [0, 0, -1]
        elif facing == '+X':
            verts = [[0, -hh, -hw], [0, -hh, hw], [0, hh, hw], [0, hh, -hw]]
            norm = [1, 0, 0]
        else: # -X
            verts = [[0, -hh, hw], [0, -hh, -hw], [0, hh, -hw], [0, hh, hw]]
            norm = [-1, 0, 0]

        normals = [norm, norm, norm, norm]
        uvs = [[0, 1], [1, 1], [1, 0], [0, 0]]
        indices = [0, 1, 2, 0, 2, 3]

        return self.add_geometry(
            np.array(verts, dtype=np.float32),
            np.array(normals, dtype=np.float32),
            np.array(uvs, dtype=np.float32),
            np.array(indices, dtype=np.uint16),
            material_idx,
            name
        )

    def create_cylinder(self, radius: float, height: float, material_idx: int, name: str, segments: int = 12) -> int:
        hh = height / 2
        verts = []
        normals = []
        uvs = []
        indices = []

        # Side vertices
        for i in range(segments + 1):
            theta = i * 2 * np.pi / segments
            x = np.cos(theta) * radius
            z = np.sin(theta) * radius
            nx = np.cos(theta)
            nz = np.sin(theta)
            u = i / segments

            verts.append([x, -hh, z])
            normals.append([nx, 0, nz])
            uvs.append([u, 1])

            verts.append([x, hh, z])
            normals.append([nx, 0, nz])
            uvs.append([u, 0])

        for i in range(segments):
            b = i * 2
            indices.extend([b, b+1, b+3, b, b+3, b+2])

        return self.add_geometry(
            np.array(verts, dtype=np.float32),
            np.array(normals, dtype=np.float32),
            np.array(uvs, dtype=np.float32),
            np.array(indices, dtype=np.uint16),
            material_idx,
            name
        )

    def add_node(self, name: str, mesh: int = None, translation=None, rotation=None, scale=None, children=None) -> int:
        node = {'name': name}
        if mesh is not None:
            node['mesh'] = mesh
        if translation is not None:
            node['translation'] = [float(v) for v in translation]
        if rotation is not None:
            node['rotation'] = [float(v) for v in rotation]
        if scale is not None:
            node['scale'] = [float(v) for v in scale]
        if children is not None and len(children) > 0:
            node['children'] = children
        idx = len(self.nodes)
        self.nodes.append(node)
        return idx

    def build_glb(self, output_path: str, root_node_idx: int = None):
        if root_node_idx is None:
            root_node_idx = len(self.nodes) - 1

        # Embed images into buffer views
        gltf_images = []
        for img_dict in self.images:
            bv_idx, _, _ = self._add_buffer_data(img_dict['bytes'])
            gltf_images.append({
                'bufferView': bv_idx,
                'mimeType': img_dict['mimeType']
            })

        # Assemble glTF JSON structure
        gltf = {
            'asset': {
                'version': '2.0',
                'generator': 'EcoSort Kai Character GLB Generator'
            },
            'scene': 0,
            'scenes': [{'nodes': [root_node_idx]}], # Point to actual root node
            'nodes': self.nodes,
            'meshes': self.meshes,
            'materials': self.materials,
            'textures': self.textures,
            'images': gltf_images,
            'accessors': self.accessors,
            'bufferViews': self.buffer_views,
            'buffers': [{'byteLength': len(self.buffer_bytes)}]
        }

        json_bytes = json.dumps(gltf).encode('utf-8')
        json_pad = (4 - (len(json_bytes) % 4)) % 4
        json_bytes += b' ' * json_pad

        bin_pad = (4 - (len(self.buffer_bytes) % 4)) % 4
        self.buffer_bytes.extend(b'\x00' * bin_pad)

        total_length = 12 + 8 + len(json_bytes) + 8 + len(self.buffer_bytes)

        header = struct.pack('<4sII', b'glTF', 2, total_length)
        json_header = struct.pack('<II', len(json_bytes), 0x4E4F534A) # JSON
        bin_header = struct.pack('<II', len(self.buffer_bytes), 0x004E4942) # BIN\0

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(header)
            f.write(json_header)
            f.write(json_bytes)
            f.write(bin_header)
            f.write(self.buffer_bytes)

        print(f"Generated GLB successfully: {output_path} ({total_length} bytes)")

def build_kai_model(output_path: str):
    builder = GLTFBuilder()

    # 1. Textures extracted directly from turnaround photos
    tex_face_idx = builder.add_image('public/images/kai_tex_face.png')
    tex_hoodie_idx = builder.add_image('public/images/kai_tex_hoodie_front.png')
    tex_backpack_idx = builder.add_image('public/images/kai_tex_backpack.png')
    tex_hair_idx = builder.add_image('public/images/kai_tex_hair.png')
    tex_shorts_idx = builder.add_image('public/images/kai_tex_shorts.png')
    tex_sneaker_idx = builder.add_image('public/images/kai_tex_sneaker.png')

    # 2. PBR Materials
    mat_face = builder.add_material('MatKaiFace', texture_idx=tex_face_idx, roughness=0.5, double_sided=True)
    mat_hoodie_front = builder.add_material('MatKaiHoodieFront', texture_idx=tex_hoodie_idx, roughness=0.6, double_sided=True)
    mat_backpack = builder.add_material('MatKaiBackpack', texture_idx=tex_backpack_idx, roughness=0.6, double_sided=True)
    mat_hair_tex = builder.add_material('MatKaiHairTex', texture_idx=tex_hair_idx, roughness=0.7, double_sided=True)
    mat_shorts_tex = builder.add_material('MatKaiShortsTex', texture_idx=tex_shorts_idx, roughness=0.7, double_sided=True)
    mat_sneaker_tex = builder.add_material('MatKaiSneakerTex', texture_idx=tex_sneaker_idx, roughness=0.4, double_sided=True)

    # Solid accent materials matching character turnaround
    mat_skin = builder.add_material('MatSkin', base_color=(0.992, 0.886, 0.780, 1.0), roughness=0.55) # #fde2c7
    mat_hoodie_yellow = builder.add_material('MatHoodieYellow', base_color=(0.980, 0.800, 0.082, 1.0), roughness=0.65) # #facc15
    mat_hoodie_shade = builder.add_material('MatHoodieShade', base_color=(0.851, 0.467, 0.024, 1.0), roughness=0.65) # #d97706
    mat_brown_hair = builder.add_material('MatBrownHair', base_color=(0.271, 0.102, 0.012, 1.0), roughness=0.8) # #451a03
    mat_backpack_green = builder.add_material('MatBackpackGreen', base_color=(0.302, 0.486, 0.059, 1.0), roughness=0.6) # #4d7c0f
    mat_denim_blue = builder.add_material('MatDenimBlue', base_color=(0.114, 0.306, 0.847, 1.0), roughness=0.7) # #1d4ed8
    mat_denim_cuff = builder.add_material('MatDenimCuff', base_color=(0.231, 0.510, 0.965, 1.0), roughness=0.7) # #3b82f6
    mat_white = builder.add_material('MatWhite', base_color=(0.98, 0.98, 0.98, 1.0), roughness=0.3)
    mat_string_white = builder.add_material('MatDrawstring', base_color=(1.0, 1.0, 1.0, 1.0), roughness=0.4)

    # -------------------------------------------------------------------------
    # 3. MESHES
    # -------------------------------------------------------------------------
    # Torso
    m_torso_box = builder.create_box(0.54, 0.48, 0.36, mat_hoodie_yellow, 'TorsoBox')
    m_torso_front = builder.create_quad(0.52, 0.46, mat_hoodie_front, 'TorsoFrontQuad', facing='+Z')
    m_hoodie_hem = builder.create_box(0.55, 0.08, 0.37, mat_hoodie_shade, 'HoodieHemMesh')
    m_hoodie_collar = builder.create_box(0.44, 0.08, 0.38, mat_hoodie_yellow, 'HoodieCollarMesh')
    m_drawstring = builder.create_cylinder(0.015, 0.22, mat_string_white, 'DrawstringMesh')

    # Backpack
    m_backpack_box = builder.create_box(0.42, 0.42, 0.16, mat_backpack_green, 'BackpackBox')
    m_backpack_back = builder.create_quad(0.40, 0.40, mat_backpack, 'BackpackBackQuad', facing='-Z')
    m_backpack_flap = builder.create_box(0.43, 0.12, 0.17, mat_backpack_green, 'BackpackFlapMesh')

    # Head & Face
    m_head_box = builder.create_box(0.50, 0.50, 0.46, mat_skin, 'HeadBox')
    m_face_front = builder.create_quad(0.48, 0.48, mat_face, 'FaceFrontQuad', facing='+Z')
    m_ear = builder.create_cylinder(0.06, 0.04, mat_skin, 'EarMesh')

    # Hair
    m_hair_top = builder.create_box(0.54, 0.26, 0.50, mat_hair_tex, 'HairTopMesh')
    m_hair_back = builder.create_box(0.52, 0.38, 0.14, mat_brown_hair, 'HairBackMesh')
    m_hair_bang = builder.create_box(0.14, 0.18, 0.06, mat_hair_tex, 'HairBangMesh')
    m_hair_side = builder.create_box(0.08, 0.26, 0.12, mat_brown_hair, 'HairSideMesh')

    # Arms
    m_arm_upper = builder.create_box(0.16, 0.36, 0.16, mat_hoodie_yellow, 'UpperArmMesh')
    m_arm_cuff = builder.create_box(0.17, 0.06, 0.17, mat_hoodie_shade, 'ArmCuffMesh')
    m_hand = builder.create_box(0.13, 0.13, 0.13, mat_skin, 'HandMesh')

    # Shorts & Legs
    m_shorts_box = builder.create_box(0.20, 0.22, 0.22, mat_denim_blue, 'ShortsMesh')
    m_shorts_front = builder.create_quad(0.19, 0.21, mat_shorts_tex, 'ShortsFrontQuad', facing='+Z')
    m_shorts_cuff = builder.create_box(0.21, 0.05, 0.23, mat_denim_cuff, 'ShortsCuffMesh')
    m_shin = builder.create_box(0.13, 0.22, 0.13, mat_skin, 'ShinMesh')
    m_sock = builder.create_box(0.14, 0.10, 0.14, mat_white, 'SockMesh')

    # Sneaker
    m_sneaker_box = builder.create_box(0.17, 0.14, 0.30, mat_denim_blue, 'SneakerBodyMesh')
    m_sneaker_side = builder.create_quad(0.28, 0.13, mat_sneaker_tex, 'SneakerSideQuad', facing='+X')
    m_sneaker_sole = builder.create_box(0.19, 0.06, 0.33, mat_white, 'SneakerSoleMesh')
    m_sneaker_toe = builder.create_box(0.18, 0.08, 0.10, mat_white, 'SneakerToeMesh')

    # -------------------------------------------------------------------------
    # 4. HIERARCHICAL NODES (Leaf-to-Root Assembly)
    # -------------------------------------------------------------------------
    # Torso leaf nodes
    n_torso_box = builder.add_node('TorsoBoxNode', mesh=m_torso_box, translation=[0, 0.95, 0])
    n_torso_front = builder.add_node('TorsoFrontNode', mesh=m_torso_front, translation=[0, 0.95, 0.182])
    n_hoodie_hem = builder.add_node('HoodieHemNode', mesh=m_hoodie_hem, translation=[0, 0.70, 0])
    n_hoodie_collar = builder.add_node('HoodieCollarNode', mesh=m_hoodie_collar, translation=[0, 1.20, 0])
    n_ds_l = builder.add_node('DrawstringL', mesh=m_drawstring, translation=[-0.08, 1.05, 0.19])
    n_ds_r = builder.add_node('DrawstringR', mesh=m_drawstring, translation=[0.08, 1.05, 0.19])

    # Backpack leaf nodes
    n_bp_box = builder.add_node('BackpackBoxNode', mesh=m_backpack_box, translation=[0, 0.96, -0.26])
    n_bp_back = builder.add_node('BackpackBackNode', mesh=m_backpack_back, translation=[0, 0.96, -0.342])
    n_bp_flap = builder.add_node('BackpackFlapNode', mesh=m_backpack_flap, translation=[0, 1.15, -0.26])

    # Assemble BackpackGroup
    n_backpack_group = builder.add_node('Backpack', children=[n_bp_box, n_bp_back, n_bp_flap])

    # Assemble TorsoGroup
    n_torso_group = builder.add_node('TorsoGroup', children=[
        n_torso_box, n_torso_front, n_hoodie_hem, n_hoodie_collar, n_ds_l, n_ds_r, n_backpack_group
    ])

    # Head and Hair leaf nodes
    n_head_box = builder.add_node('HeadBoxNode', mesh=m_head_box, translation=[0, 0.22, 0])
    n_face_front = builder.add_node('FaceFrontNode', mesh=m_face_front, translation=[0, 0.22, 0.232])
    n_ear_l = builder.add_node('EarL', mesh=m_ear, translation=[-0.26, 0.22, 0], rotation=[0, 0, 0.7071, 0.7071])
    n_ear_r = builder.add_node('EarR', mesh=m_ear, translation=[0.26, 0.22, 0], rotation=[0, 0, 0.7071, 0.7071])

    # Hair nodes
    n_hair_top = builder.add_node('HairTopNode', mesh=m_hair_top, translation=[0, 0.38, -0.02])
    n_hair_back = builder.add_node('HairBackNode', mesh=m_hair_back, translation=[0, 0.20, -0.22])
    n_bang_1 = builder.add_node('HairBang1', mesh=m_hair_bang, translation=[-0.12, 0.36, 0.24], rotation=[0.1, 0.05, -0.15, 0.98])
    n_bang_2 = builder.add_node('HairBang2', mesh=m_hair_bang, translation=[0.02, 0.38, 0.25], rotation=[0.15, 0, 0.05, 0.98])
    n_bang_3 = builder.add_node('HairBang3', mesh=m_hair_bang, translation=[0.14, 0.35, 0.24], rotation=[0.1, -0.05, 0.2, 0.97])
    n_hair_s_l = builder.add_node('HairSideL', mesh=m_hair_side, translation=[-0.26, 0.18, 0.08])
    n_hair_s_r = builder.add_node('HairSideR', mesh=m_hair_side, translation=[0.26, 0.18, 0.08])

    # Assemble HeadPivot (Pivot at y=1.20)
    n_head_pivot = builder.add_node('HeadPivot', translation=[0, 1.22, 0], children=[
        n_head_box, n_face_front, n_ear_l, n_ear_r, n_hair_top, n_hair_back,
        n_bang_1, n_bang_2, n_bang_3, n_hair_s_l, n_hair_s_r
    ])

    # Left Arm
    n_la_upper = builder.add_node('LA_Upper', mesh=m_arm_upper, translation=[0, -0.18, 0])
    n_la_cuff = builder.add_node('LA_Cuff', mesh=m_arm_cuff, translation=[0, -0.37, 0])
    n_la_hand = builder.add_node('LA_Hand', mesh=m_hand, translation=[0, -0.46, 0])
    n_left_arm_pivot = builder.add_node('LeftArmPivot', translation=[-0.35, 1.10, 0], children=[
        n_la_upper, n_la_cuff, n_la_hand
    ])

    # Right Arm
    n_ra_upper = builder.add_node('RA_Upper', mesh=m_arm_upper, translation=[0, -0.18, 0])
    n_ra_cuff = builder.add_node('RA_Cuff', mesh=m_arm_cuff, translation=[0, -0.37, 0])
    n_ra_hand = builder.add_node('RA_Hand', mesh=m_hand, translation=[0, -0.46, 0])
    n_right_arm_pivot = builder.add_node('RightArmPivot', translation=[0.35, 1.10, 0], children=[
        n_ra_upper, n_ra_cuff, n_ra_hand
    ])

    # Helper function for leg sub-tree
    def create_leg_tree(is_left: bool):
        side_sign = -1 if is_left else 1
        prefix = 'L' if is_left else 'R'
        
        n_sh_box = builder.add_node(f'{prefix}_ShortsBox', mesh=m_shorts_box, translation=[0, -0.11, 0])
        n_sh_front = builder.add_node(f'{prefix}_ShortsFront', mesh=m_shorts_front, translation=[0, -0.11, 0.112])
        n_sh_cuff = builder.add_node(f'{prefix}_ShortsCuff', mesh=m_shorts_cuff, translation=[0, -0.22, 0])
        n_shin = builder.add_node(f'{prefix}_Shin', mesh=m_shin, translation=[0, -0.32, 0])
        n_sock = builder.add_node(f'{prefix}_Sock', mesh=m_sock, translation=[0, -0.44, 0])
        
        # Sneaker
        n_snk_box = builder.add_node(f'{prefix}_SnkBox', mesh=m_sneaker_box, translation=[0, -0.54, 0.04])
        n_snk_side = builder.add_node(f'{prefix}_SnkSide', mesh=m_sneaker_side, translation=[side_sign * 0.087, -0.54, 0.04])
        n_snk_sole = builder.add_node(f'{prefix}_SnkSole', mesh=m_sneaker_sole, translation=[0, -0.62, 0.04])
        n_snk_toe = builder.add_node(f'{prefix}_SnkToe', mesh=m_sneaker_toe, translation=[0, -0.58, 0.17])
        
        n_sneaker_group = builder.add_node(f'{prefix}_Sneaker', children=[
            n_snk_box, n_snk_side, n_snk_sole, n_snk_toe
        ])

        pivot_name = 'LeftLegPivot' if is_left else 'RightLegPivot'
        return builder.add_node(pivot_name, translation=[side_sign * 0.15, 0.65, 0], children=[
            n_sh_box, n_sh_front, n_sh_cuff, n_shin, n_sock, n_sneaker_group
        ])

    n_left_leg_pivot = create_leg_tree(True)
    n_right_leg_pivot = create_leg_tree(False)

    # BodyRoot node
    n_body_root = builder.add_node('BodyRoot', children=[
        n_torso_group, n_head_pivot, n_left_arm_pivot, n_right_arm_pivot, n_left_leg_pivot, n_right_leg_pivot
    ])

    # Root Node
    builder.add_node('KaiRoot', children=[n_body_root])

    # Build and write final GLB file
    builder.build_glb(output_path)

if __name__ == '__main__':
    out_file = 'public/models/kai.glb'
    print(f"Generating Kai GLB at {out_file}...")
    build_kai_model(out_file)
